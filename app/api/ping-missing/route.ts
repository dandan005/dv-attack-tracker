import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";
import { getCycleInfo } from "@/lib/cycle";
import { sendDayPushes } from "@/lib/dayPush";

async function findMissingAndPing(forceHour?: number, onlyGuildId?: number, withPush = false) {
  const admin = createAdminClient();

  const { data: settings } = await admin.from("app_settings").select("*").eq("id", 1).single();
  const { data: allGuilds } = await admin.from("guilds").select("id, code, name, discord_webhook_url").order("id");
  const guilds = (allGuilds ?? []).filter((g: any) => onlyGuildId === undefined || g.id === onlyGuildId);

  const { dayNumber, cycleStartISO } = getCycleInfo();

  const { data: members } = await admin.from("members").select("id, discord_id, username, guild_id");
  const { data: logs } = await admin
    .from("attack_logs")
    .select("member_id")
    .eq("cycle_start", cycleStartISO)
    .eq("day_number", dayNumber);

  const loggedIds = new Set<string>((logs ?? []).map((l: any) => l.member_id));
  const pingHour = forceHour ?? new Date().getUTCHours();
  const intro = pingHour === 14 ? `⚔️ **Dragon Valley — D${dayNumber} is live!**` : pingHour === 13 ? `🚨 **LAST CALL — D${dayNumber} resets in 1 hour!**` : `🐉 **D${dayNumber} check-in — still waiting on:**`;
  const outro = pingHour === 14 ? "Your attack is not logged yet. Get it in today!" : pingHour === 13 ? "Attack now or lose the day. No excuses!" : "The dragon will not slay itself. Log your attack!";

  const results: any[] = [];
  let total = 0;

  for (const g of guilds as any[]) {
    const webhookUrl = g.discord_webhook_url || (g.code === "G2" ? settings?.discord_webhook_url || process.env.DISCORD_WEBHOOK_URL : null);
    const missing = (members ?? []).filter((m: any) => m.guild_id === g.id && !loggedIds.has(m.id));

    if (missing.length === 0) {
      results.push({ guild: g.code, missing: 0, sent: false });
      continue;
    }
    if (!webhookUrl) {
      results.push({ guild: g.code, missing: missing.length, sent: false, note: "no webhook" });
      continue;
    }

    const mentions = missing.map((m: any) => `<@${m.discord_id}>`).join(" ");
    const content = `${intro}\n${mentions}\n${outro}`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: ["users"] },
      }),
    });

    total += missing.length;
    results.push({ guild: g.code, missing: missing.length, sent: true });
  }

  if (withPush) await sendDayPushes(admin, pingHour, dayNumber, cycleStartISO, loggedIds);

  if (onlyGuildId !== undefined && results[0]?.note === "no webhook") {
    return { error: "No Discord webhook configured.", status: 400 as const };
  }

  return { ok: true, missing: total, guilds: results };
}

export async function POST(req: NextRequest) {
  // Manual ping is available only to a currently verified guild member, and pings only their own guild.
  const auth = await getGuildMember();
  if (auth.error || !auth.user || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const admin = createAdminClient();
  const { data: me } = await admin.from("members").select("guild_id, is_super_admin, is_admin, is_creator").eq("id", auth.member.id).single();
  if (!me?.is_creator && !me?.is_admin && !me?.is_super_admin) {
    return NextResponse.json({ error: "Only admins can ping members" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const isAll = !!me?.is_super_admin && body.guild === "ALL";
  const target = me?.is_super_admin && typeof body.guild === "number" ? body.guild : me?.guild_id;
  if (!isAll && !target) {
    return NextResponse.json({ error: "No guild assigned" }, { status: 403 });
  }

  const result = await findMissingAndPing(undefined, isAll ? undefined : (target as number));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  // used by cron-job.org for automatic reminders — protected by a shared secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const p = req.nextUrl.searchParams.get("ping");
  const forceHour = p === "1" ? 14 : p === "3" ? 13 : p === "2" ? 23 : undefined;
  const result = await findMissingAndPing(forceHour, undefined, true);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
