import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

function denied(error: string | null) {
  return NextResponse.json({ error }, { status: error === "Not authenticated" ? 401 : 403 });
}

export async function GET() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return denied(auth.error);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .select("id, anchor_date, reset_hour_utc, wyvern_element, wyvern_set_by")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return denied(auth.error);

  const body = await req.json().catch(() => ({}));
  const update: Record<string, string | number | null> = {};

  if (body.anchor_date !== undefined) {
    if (typeof body.anchor_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.anchor_date)) {
      return NextResponse.json({ error: "Invalid anchor date" }, { status: 400 });
    }
    update.anchor_date = body.anchor_date;
  }

  if (body.reset_hour_utc !== undefined) {
    const resetHour = Number(body.reset_hour_utc);
    if (!Number.isInteger(resetHour) || resetHour < 0 || resetHour > 23) {
      return NextResponse.json({ error: "Reset hour must be between 0 and 23" }, { status: 400 });
    }
    update.reset_hour_utc = resetHour;
  }

  if (body.wyvern_element !== undefined) {
    if (!["wind", "fire", "earth", "water"].includes(body.wyvern_element)) {
      return NextResponse.json({ error: "Invalid wyvern element" }, { status: 400 });
    }
    update.wyvern_element = body.wyvern_element;
    update.wyvern_set_by = auth.member.username;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No settings supplied" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .update(update)
    .eq("id", 1)
    .select("id, anchor_date, reset_hour_utc, wyvern_element, wyvern_set_by")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
