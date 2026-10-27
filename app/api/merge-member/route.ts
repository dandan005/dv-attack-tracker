import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";

// POST { placeholderId, targetId }: fold a roster-only player into the signed-in member they are.
export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });

  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator").eq("id", auth.member.id).maybeSingle();
  const staff = !!(me && (me.is_super_admin || me.is_admin || me.is_creator));
  if (!me || !staff) return NextResponse.json({ error: "Staff only" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const placeholderId = typeof body?.placeholderId === "string" ? body.placeholderId : "";
  const targetId = typeof body?.targetId === "string" ? body.targetId : "";
  if (!placeholderId || !targetId || placeholderId === targetId) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { data: rows } = await db.from("members").select("id, guild_id, discord_id").in("id", [placeholderId, targetId]);
  const ph = (rows ?? []).find((r: any) => r.id === placeholderId);
  const tg = (rows ?? []).find((r: any) => r.id === targetId);
  if (!ph || !tg) return NextResponse.json({ error: "Player not found" }, { status: 404 });
  if (!String(ph.discord_id).startsWith("roster:")) return NextResponse.json({ error: "That player already has a Discord login" }, { status: 400 });
  if (!me.is_super_admin && (ph.guild_id !== me.guild_id || tg.guild_id !== me.guild_id)) {
    return NextResponse.json({ error: "Both players must be in your guild" }, { status: 403 });
  }

  const { error } = await db.rpc("merge_member", { p_placeholder: placeholderId, p_target: targetId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
