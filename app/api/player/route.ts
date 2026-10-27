import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const BAD = Symbol("bad");
function num(v: unknown): number | null | typeof BAD {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 99999 ? n : BAD;
}
const err = (m: string, s: number) => NextResponse.json({ error: m }, { status: s });

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return err(auth.error ?? "Forbidden", auth.error === "Not authenticated" ? 401 : 403);
  const body = await req.json().catch(() => null);
  const action = body?.action;
  if (action !== "add" && action !== "edit" && action !== "delete") return err("Bad request", 400);
  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator").eq("id", auth.member.id).maybeSingle();
  if (!me || !(me.is_creator || me.is_admin || me.is_super_admin)) return err("Forbidden", 403);
  const wide = !!(me.is_creator || me.is_super_admin);
  const canGuild = (g: number | null) => wide || g === null || g === me.guild_id;
  const level = num(body.level);
  const stage = num(body.stage);
  const g = body.guild_id === null || body.guild_id === undefined || body.guild_id === "" ? null : Number(body.guild_id);
  if (level === BAD || stage === BAD || (g !== null && g !== 1 && g !== 2)) return err("Bad values", 400);
  if (!canGuild(g)) return err("Forbidden", 403);

  if (action === "add") {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
    if (!name) return err("Name required", 400);
    const key = name.toLowerCase();
    const { data: dup } = await db.from("roster").select("key").eq("key", key).maybeSingle();
    if (dup) return err("Already on the roster", 409);
    const { data: acc } = await db.from("members").select("id").ilike("username", name.replace(/[\\%_]/g, "\\$&")).limit(1);
    if (acc && acc.length) return err("Already has an account, edit them instead", 409);
    const { error } = await db.from("roster").insert({ key, name, guild_id: g, level, stage });
    if (error) return err("Add failed", 500);
    return NextResponse.json({ ok: true });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return err("Bad request", 400);
  if (id === me.id && action === "delete") return err("You can't remove yourself", 400);
  const isRoster = id.startsWith("roster-");
  const { data: target } = isRoster ? await db.from("roster").select("key, guild_id").eq("key", id.slice(7)).maybeSingle() : await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator").eq("id", id).maybeSingle();
  if (!target) return err("Not found", 404);
  if (!canGuild(target.guild_id)) return err("Forbidden", 403);
  // Only creator / super admin may touch admin, super admin or creator accounts (admins may still edit themselves).
  const tgt = target as { id?: string; is_admin?: boolean; is_super_admin?: boolean; is_creator?: boolean };
  if (!wide && !isRoster && tgt.id !== me.id && (tgt.is_admin || tgt.is_super_admin || tgt.is_creator)) return err("Forbidden", 403);

  if (action === "delete") {
    // Remove the uploaded picture from storage along with the player.
    const { data: pic } = isRoster ? await db.from("roster").select("custom_avatar_url").eq("key", id.slice(7)).maybeSingle() : await db.from("members").select("custom_avatar_url").eq("id", id).maybeSingle();
    const marker = "/object/public/avatars/";
    const url: string | null = (pic as { custom_avatar_url?: string | null } | null)?.custom_avatar_url ?? null;
    const at = url ? url.indexOf(marker) : -1;
    if (url && at >= 0) await db.storage.from("avatars").remove([decodeURIComponent(url.slice(at + marker.length).split("?")[0])]);
    const { error } = isRoster ? await db.from("roster").delete().eq("key", id.slice(7)) : await db.from("members").delete().eq("id", id);
    if (error) return err("Delete failed", 500);
    return NextResponse.json({ ok: true });
  }

  const nm = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  const patch: Record<string, unknown> = { level, stage, guild_id: g };
  // Roster rows keep their name. Signed-in members get an in-game name that login never overwrites.
  if (isRoster) {
    if (nm) patch.name = nm;
  } else {
    patch.game_name = nm || null;
  }
  if (typeof body.avatar === "string") patch.custom_avatar = /^[a-z0-9]{1,30}$/.test(body.avatar) ? body.avatar : null;
  const t = body.tier;
  if (t === null || (typeof t === "number" && Number.isInteger(t) && t >= 1 && t <= 26)) patch.promotion_tier = t;
  const { error } = isRoster ? await db.from("roster").update(patch).eq("key", id.slice(7)) : await db.from("members").update(patch).eq("id", id);
  if (error) return err("Update failed", 500);
  return NextResponse.json({ ok: true });
}
