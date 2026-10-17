import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const MAPS = ["wasteland", "lava", "icevale", "windcliff"];

function intOrNull(v: unknown, min: number, max: number): number | null | undefined {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

function denied(error: string | null) {
  return NextResponse.json({ error }, { status: error === "Not authenticated" ? 401 : 403 });
}

export async function GET() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return denied(auth.error);

  const { data, error } = await createAdminClient()
    .from("members")
    .select("level, stage, dv_map, gr_boss")
    .eq("id", auth.member.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return denied(auth.error);

  const body = await req.json().catch(() => ({}));
  const update: Record<string, number | string | null> = {};

  if (body.level !== undefined) {
    const v = intOrNull(body.level, 1, 9999);
    if (v === undefined) return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    update.level = v;
  }
  if (body.stage !== undefined) {
    const v = intOrNull(body.stage, 0, 99999);
    if (v === undefined) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    update.stage = v;
  }
  if (body.gr_boss !== undefined) {
    const v = intOrNull(body.gr_boss, 1, 6);
    if (v === undefined) return NextResponse.json({ error: "Invalid GR boss" }, { status: 400 });
    update.gr_boss = v;
  }
  if (body.dv_map !== undefined) {
    if (body.dv_map !== null && body.dv_map !== "" && !MAPS.includes(body.dv_map)) {
      return NextResponse.json({ error: "Invalid DV map" }, { status: 400 });
    }
    update.dv_map = body.dv_map || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  }

  const { error } = await createAdminClient().from("members").update(update).eq("id", auth.member.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
