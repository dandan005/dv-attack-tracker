import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/webp", "image/png", "image/jpeg"];
const BUCKET = "avatars";
const err = (m: string, s: number) => NextResponse.json({ error: m }, { status: s });

// Staff can change players in their own guild; creator and super admin can change anyone.
async function staffCanEdit(id: string) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return { error: err(auth.error ?? "Forbidden", auth.error === "Not authenticated" ? 401 : 403) };
  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator").eq("id", auth.member.id).maybeSingle();
  if (!me || !(me.is_creator || me.is_admin || me.is_super_admin)) return { error: err("Forbidden", 403) };
  const wide = !!(me.is_creator || me.is_super_admin);
  const isRoster = id.startsWith("roster-");
  const { data: target } = isRoster
    ? await db.from("roster").select("key, guild_id, custom_avatar_url").eq("key", id.slice(7)).maybeSingle()
    : await db.from("members").select("id, guild_id, is_admin, is_super_admin, is_creator, custom_avatar_url").eq("id", id).maybeSingle();
  if (!target) return { error: err("Not found", 404) };
  if (!(wide || target.guild_id === null || target.guild_id === me.guild_id)) return { error: err("Forbidden", 403) };
  const tgt = target as { id?: string; is_admin?: boolean; is_super_admin?: boolean; is_creator?: boolean };
  if (!wide && !isRoster && tgt.id !== me.id && (tgt.is_admin || tgt.is_super_admin || tgt.is_creator)) return { error: err("Forbidden", 403) };
  return { db, isRoster, current: (target as { custom_avatar_url?: string | null }).custom_avatar_url ?? null };
}

function sniff(b: Uint8Array) {
  const png = b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const jpg = b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const webp = b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  return png ? "png" : jpg ? "jpg" : webp ? "webp" : null;
}

// Storage path is built from the id only (hashed for roster keys), never from user input.
const folder = (id: string) => (id.startsWith("roster-") ? "r-" + createHash("sha1").update(id.slice(7)).digest("hex").slice(0, 20) : id);

async function dropOld(db: ReturnType<typeof createAdminClient>, url: string | null) {
  const marker = "/object/public/" + BUCKET + "/";
  const i = url ? url.indexOf(marker) : -1;
  if (url && i >= 0) await db.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marker.length).split("?")[0])]);
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const id = form?.get("id");
  const file = form?.get("file");
  if (typeof id !== "string" || !id || !(file instanceof File)) return err("Bad request", 400);
  if (!TYPES.includes(file.type) || file.size > MAX_BYTES) return err("Use a PNG, JPG or WEBP under 2 MB", 400);
  const who = await staffCanEdit(id);
  if ("error" in who) return who.error;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return err("Not a valid image", 400);
  const { db, isRoster, current } = who;
  const path = folder(id) + "/" + Date.now() + "." + kind;
  const up = await db.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
  if (up.error) return err("Upload failed", 500);
  const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = isRoster ? await db.from("roster").update({ custom_avatar_url: url }).eq("key", id.slice(7)) : await db.from("members").update({ custom_avatar_url: url }).eq("id", id);
  if (error) {
    await db.storage.from(BUCKET).remove([path]);
    return err("Save failed", 500);
  }
  await dropOld(db, current);
  return NextResponse.json({ ok: true, url });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return err("Bad request", 400);
  const who = await staffCanEdit(id);
  if ("error" in who) return who.error;
  const { db, isRoster, current } = who;
  const { error } = isRoster ? await db.from("roster").update({ custom_avatar_url: null }).eq("key", id.slice(7)) : await db.from("members").update({ custom_avatar_url: null }).eq("id", id);
  if (error) return err("Remove failed", 500);
  await dropOld(db, current);
  return NextResponse.json({ ok: true });
}
