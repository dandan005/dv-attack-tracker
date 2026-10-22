import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";
import { getCycleInfo } from "@/lib/cycle";
import { serverLog } from "@/lib/appLog";

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.user || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }
  const member = auth.member;

  const { data: g } = await createAdminClient().from("members").select("guild_id").eq("id", member.id).single();
  if (!g?.guild_id) return NextResponse.json({ error: "Ask an admin to assign you to a guild first" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { cycleStartISO, dayNumber: today } = getCycleInfo();
  const dayNumber = Number(body.dayNumber);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 6) {
    return NextResponse.json({ error: "Day number must be between 1 and 6" }, { status: 400 });
  }
  if (dayNumber > today) return NextResponse.json({ error: "That day hasn't started yet" }, { status: 400 });

  const empty = (v: unknown) => v === null || v === undefined || v === "";
  const promotionTier = empty(body.promotionTier) ? null : Number(body.promotionTier);
  const damageScore = empty(body.damageScore) ? null : Number(body.damageScore);
  if (promotionTier !== null && (!Number.isInteger(promotionTier) || promotionTier < 0 || promotionTier > 26)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (damageScore !== null && (!Number.isInteger(damageScore) || damageScore < 0 || damageScore > 1e15)) {
    return NextResponse.json({ error: "Invalid damage score" }, { status: 400 });
  }

  // ignoreDuplicates: a second log for the same day never overwrites the first one.
  const { error } = await auth.supabase.from("attack_logs").upsert(
    {
      member_id: member.id,
      day_number: dayNumber,
      cycle_start: cycleStartISO,
      logged_at: new Date().toISOString(),
      promotion_tier: promotionTier,
      damage_score: damageScore,
    },
    { onConflict: "member_id,day_number,cycle_start", ignoreDuplicates: true }
  );
  if (error) {
    await serverLog("error", "log-attack", error.message, { day: dayNumber }, member.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
