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

  const body = await req.json();
  const dayNumber = Number(body.dayNumber);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 6) {
    return NextResponse.json({ error: "Day number must be between 1 and 6" }, { status: 400 });
  }

  const { cycleStartISO } = getCycleInfo();

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
