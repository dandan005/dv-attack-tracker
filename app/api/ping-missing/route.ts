import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";
import { getCycleInfo } from "@/lib/cycle";
import { sendDayPushes } from "@/lib/dayPush";

const DISCORD_APP_BOT_TOKEN = process.env.DISCORD_APP_BOT_TOKEN;

// Define clear named constants for ping scheduled hours
const PING_HOUR_RESET_WARNING = 13; // 1 Hour before daily reset
const PING_HOUR_DAILY_START = 14; // Daily reset / live time
const PING_HOUR_EVENING_CHECK = 23; // Mid-cycle evening check

async function findMissingAndPing(
  forceHour?: number,
  onlyGuildId?: number,
  withPush = false,
) {
  if (!DISCORD_APP_BOT_TOKEN) {
    return {
      error: "DISCORD_APP_BOT_TOKEN is missing in environment variables.",
      status: 500 as const,
    };
  }

  const admin = createAdminClient();

  const { data: allGuilds } = await admin
    .from("guilds")
    .select("id, code, name, discord_channel_id")
    .order("id");

  const guilds = (allGuilds ?? []).filter(
    (g: any) => onlyGuildId === undefined || g.id === onlyGuildId,
  );

  const { dayNumber, cycleStartISO } = getCycleInfo();

  const { data: members } = await admin
    .from("members")
    .select("id, discord_id, username, guild_id");
  const { data: logs } = await admin
    .from("attack_logs")
    .select("member_id")
    .eq("cycle_start", cycleStartISO)
    .eq("day_number", dayNumber);

  const loggedIds = new Set<string>((logs ?? []).map((l: any) => l.member_id));
  const pingHour = forceHour ?? new Date().getUTCHours();

  // Expressive message copy using named constants
  const intro =
    pingHour === PING_HOUR_DAILY_START
      ? `⚔️ **Dragon Valley — D${dayNumber} is live!**`
      : pingHour === PING_HOUR_RESET_WARNING
        ? `🚨 **LAST CALL — D${dayNumber} resets in 1 hour!**`
        : `🐉 **D${dayNumber} check-in — still waiting on:**`;

  const outro =
    pingHour === PING_HOUR_DAILY_START
      ? "Your attack is not logged yet. Get it in today!"
      : pingHour === PING_HOUR_RESET_WARNING
        ? "Attack now or lose the day. No excuses!"
        : "The dragon will not slay itself. Log your attack!";

  const results: any[] = [];
  let total = 0;

  for (const g of guilds as any[]) {
    const channelId = g.discord_channel_id;

    const missing = (members ?? []).filter(
      (m: any) =>
        m.guild_id === g.id &&
        !loggedIds.has(m.id) &&
        !String(m.discord_id).startsWith("roster:"),
    );

    if (missing.length === 0) {
      results.push({ guild: g.code, missing: 0, sent: false });
      continue;
    }

    if (!channelId) {
      results.push({
        guild: g.code,
        missing: missing.length,
        sent: false,
        note: "no channel configured",
      });
      continue;
    }

    const mentions = missing.map((m: any) => `<@${m.discord_id}>`).join(" ");
    const content = `${intro}\n${mentions}\n${outro}`;

    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    const payload = {
      content,
      allowed_mentions: { parse: ["users"] },
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button Component
              style: 1, // Primary (Blurple)
              custom_id: `log_attack_guild_${g.code}`, // Encodes target guild code (e.g., log_attack_guild_G1)
              label: `Log Attack (${g.code})`,
              emoji: { name: "⚔️" },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_APP_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          `[discord-bot-ping] Failed for guild ${g.code}:`,
          errorData,
        );
        results.push({
          guild: g.code,
          missing: missing.length,
          sent: false,
          error: errorData,
        });
        continue;
      }

      total += missing.length;
      results.push({ guild: g.code, missing: missing.length, sent: true });
    } catch (err: any) {
      console.error(`[discord-bot-ping] Exception for guild ${g.code}:`, err);
      results.push({
        guild: g.code,
        missing: missing.length,
        sent: false,
        error: err.message,
      });
    }
  }

  if (withPush)
    await sendDayPushes(admin, pingHour, dayNumber, cycleStartISO, loggedIds);

  if (
    onlyGuildId !== undefined &&
    (results[0]?.note === "no channel configured" || results[0]?.sent === false)
  ) {
    return {
      error:
        results[0]?.error || "No Discord channel configured or send failed.",
      status: 400 as const,
    };
  }

  return { ok: true, missing: total, guilds: results };
}

export async function POST(req: NextRequest) {
  // Manual ping is available only to a currently verified guild member, and pings only their own guild.
  const auth = await getGuildMember();
  if (auth.error || !auth.user || !auth.member) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === "Not authenticated" ? 401 : 403 },
    );
  }

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("members")
    .select("guild_id, is_super_admin, is_admin, is_creator")
    .eq("id", auth.member.id)
    .single();

  if (!me?.is_creator && !me?.is_admin && !me?.is_super_admin) {
    return NextResponse.json(
      { error: "Only admins can ping members" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const isAll = !!me?.is_super_admin && body.guild === "ALL";
  const target =
    me?.is_super_admin && typeof body.guild === "number"
      ? body.guild
      : me?.guild_id;

  if (!isAll && !target) {
    return NextResponse.json({ error: "No guild assigned" }, { status: 403 });
  }

  const result = await findMissingAndPing(
    undefined,
    isAll ? undefined : (target as number),
  );
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const p = req.nextUrl.searchParams.get("ping");
  const forceHour =
    p === "1"
      ? PING_HOUR_DAILY_START
      : p === "3"
        ? PING_HOUR_RESET_WARNING
        : p === "2"
          ? PING_HOUR_EVENING_CHECK
          : undefined;

  const result = await findMissingAndPing(forceHour, undefined, true);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json(result);
}
