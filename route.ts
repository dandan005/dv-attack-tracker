import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCycleInfo } from "@/lib/cycle";

async function findMissingAndPing() {
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!settings?.discord_webhook_url) {
    return { error: "No Discord webhook configured in Settings.", status: 400 as const };
  }

  const { dayNumber, cycleStartISO } = getCycleInfo(
    settings.anchor_date ?? "2026-01-05",
    settings.reset_hour_utc ?? 0
  );

  const { data: members } = await admin.from("members").select("id, discord_id, username");
  const { data: logs } = await admin
    .from("attack_logs")
    .select("member_id")
    .eq("cycle_start", cycleStartISO)
    .eq("day_number", dayNumber);

  const loggedIds = new Set((logs ?? []).map((l: any) => l.member_id));
  const missing = (members ?? []).filter((m: any) => !loggedIds.has(m.id));

  if (missing.length === 0) {
    return { ok: true, missing: 0 };
  }

  const mentions = missing.map((m: any) => `<@${m.discord_id}>`).join(" ");
  const content = `⚔️ **Dragon Valley — D${dayNumber} attack reminder**\n${mentions}\nYou haven't logged your attack yet — don't let the guild down!`;

  await fetch(settings.discord_webhook_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      allowed_mentions: { parse: ["users"] },
    }),
  });

  return { ok: true, missing: missing.length };
}

export async function POST(req: NextRequest) {
  // manual ping, triggered by a logged-in member from the dashboard
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await findMissingAndPing();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  // used by Vercel Cron for automatic reminders — protected by a shared secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await findMissingAndPing();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
