import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCycleInfo } from "@/lib/cycle";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { dayNumber } = await req.json();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { cycleStartISO } = getCycleInfo(
    settings?.anchor_date ?? "2026-01-05",
    settings?.reset_hour_utc ?? 0
  );

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const { error } = await supabase.from("attack_logs").upsert(
    {
      member_id: member.id,
      day_number: dayNumber,
      cycle_start: cycleStartISO,
      logged_at: new Date().toISOString(),
    },
    { onConflict: "member_id,day_number,cycle_start" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
