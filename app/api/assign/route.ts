import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const MAPS = ["wasteland", "lava", "icevale", "windcliff"];

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const field = body?.field;
  const value = body?.value ?? null;
  if (!id || (field !== "dv_map" && field !== "gr_boss")) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (field === "dv_map" && value !== null && !MAPS.includes(value)) return NextResponse.json({ error: "Bad map" }, { status: 400 });
  if (field === "gr_boss" && value !== null && !(Number.isInteger(value) && value >= 1 && value <= 6)) return NextResponse.json({ error: "Bad boss" }, { status: 400 });
  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator").eq("id", auth.member.id).maybeSingle();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const isRoster = id.startsWith("roster-");
  const { data: target } = isRoster ? await db.from("roster").select("key, guild_id").eq("key", id.slice(7)).maybeSingle() : await db.from("members").select("id, guild_id").eq("id", id).maybeSingle();
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const staff = me.is_creator || me.is_admin || me.is_super_admin;
  const sameGuild = target.guild_id === null || target.guild_id === me.guild_id;
  const ok = me.is_creator || (staff && sameGuild) || (!isRoster && id === me.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { error } = isRoster ? await db.from("roster").update({ [field]: value }).eq("key", id.slice(7)) : await db.from("members").update({ [field]: value }).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
