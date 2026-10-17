import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const admin = createAdminClient();
  const { data: me } = await admin.from("members").select("is_super_admin").eq("id", auth.member.id).single();
  if (!me?.is_super_admin) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const guildId = body.guild_id === null ? null : Number(body.guild_id);
  if (!body.member_id || (guildId !== null && !Number.isInteger(guildId))) {
    return NextResponse.json({ error: "member_id and guild_id required" }, { status: 400 });
  }

  const { error } = await admin.from("members").update({ guild_id: guildId }).eq("id", body.member_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
export async function GET() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: 403 });

  const admin = createAdminClient();
  const { data: me } = await admin.from("members").select("is_super_admin").eq("id", auth.member.id).single();
  if (!me?.is_super_admin) return NextResponse.json({ error: "Super admin only" }, { status: 403 });

  const [{ data: members }, { data: guilds }] = await Promise.all([
    admin.from("members").select("id, username, guild_id").order("username"),
    admin.from("guilds").select("id, code, name").order("id"),
  ]);
  return NextResponse.json({ members: members ?? [], guilds: guilds ?? [] });
}
