import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";
import { getCycleInfo } from "@/lib/cycle";

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();

  if (auth.error || !auth.user || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const supabase = auth.supabase;
  const member = auth.member;

  // Day number and cycle start are derived server-side from the fixed
  // cycle anchor — never trust a client-supplied day number, since a
  // stale tab, cached state, or bad client logic could send the wrong
  // day (this is what caused the original data-integrity bug).
  const { dayNumber, cycleStartISO } = getCycleInfo();

  if (dayNumber < 1 || dayNumber > 6) {
    // Day 7 is standby — attacks can't be logged on it.
    return NextResponse.json({ error: "Attacks cannot be logged on standby day" }, { status: 400 });
  }

  const log = {
    member_id: member.id,
    day_number: dayNumber,
    cycle_start: cycleStartISO,
    logged_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("attack_logs").upsert(log, { onConflict: "member_id,day_number,cycle_start" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
