import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";
import { getCycleInfo } from "@/lib/cycle";

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const db = createAdminClient();
  const { data: me } = await db.from("members").select("is_super_admin").eq("id", auth.member.id).maybeSingle();
  if (!me?.is_super_admin) return NextResponse.json({ error: "Super admin only" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const memberId = typeof body?.memberId === "string" ? body.memberId : "";
  const dayNumber = Number(body?.dayNumber);
  const done = body?.done === true;
  if (!memberId || !Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 6) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { cycleStartISO } = getCycleInfo();

  if (done) {
    const { error } = await db.from("attack_logs").upsert(
      { member_id: memberId, day_number: dayNumber, cycle_start: cycleStartISO, logged_at: new Date().toISOString(), promotion_tier: null, damage_score: null },
      { onConflict: "member_id,day_number,cycle_start" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await db.from("attack_logs").delete().eq("member_id", memberId).eq("day_number", dayNumber).eq("cycle_start", cycleStartISO);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
