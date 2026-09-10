import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCycleInfo } from "@/lib/cycle";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const dayNumber = Number(body.dayNumber);
  const promotionTier = body.promotionTier === null || body.promotionTier === "" || body.promotionTier === undefined ? null : Number(body.promotionTier);
  const damageScore = body.damageScore === null || body.damageScore === "" || body.damageScore === undefined ? null : Number(body.damageScore);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 6) {
    return NextResponse.json({ error: "Day number must be between 1 and 6" }, { status: 400 });
  }
  if (promotionTier !== null && (!Number.isInteger(promotionTier) || promotionTier < 0)) {
    return NextResponse.json({ error: "Promotion tier must be a non-negative whole number" }, { status: 400 });
  }
  if (damageScore !== null && (!Number.isFinite(damageScore) || damageScore < 0)) {
    return NextResponse.json({ error: "Damage score must be a non-negative number" }, { status: 400 });
  }

  const { data: settings } = await supabase.from("app_settings").select("*").eq("id", 1).single();
  const { cycleStartISO } = getCycleInfo(settings?.anchor_date ?? "2026-01-05", settings?.reset_hour_utc ?? 0);
  const { data: member } = await supabase.from("members").select("id").eq("auth_user_id", user.id).single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const enrichedLog = {
    member_id: member.id,
    day_number: dayNumber,
    cycle_start: cycleStartISO,
    promotion_tier: promotionTier,
    damage_score: damageScore,
    logged_at: new Date().toISOString(),
  };
  const legacyLog = {
    member_id: member.id,
    day_number: dayNumber,
    cycle_start: cycleStartISO,
    logged_at: enrichedLog.logged_at,
  };

  let { error } = await supabase.from("attack_logs").upsert(enrichedLog, { onConflict: "member_id,day_number,cycle_start" });
  if (error && /promotion_tier|damage_score|column/i.test(error.message)) {
    const legacyResult = await supabase.from("attack_logs").upsert(legacyLog, { onConflict: "member_id,day_number,cycle_start" });
    error = legacyResult.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scoreTracked: promotionTier !== null || damageScore !== null });
}
