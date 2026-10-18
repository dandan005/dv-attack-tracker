import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }
  const admin = createAdminClient();
  const g = req.nextUrl.searchParams.get("guild");
  let q = admin
    .from("members")
    .select("id, username, avatar_url, promotion_tier, level, stage, dv_map, gr_boss, guild_id")
    .not("guild_id", "is", null);
  if (g && g !== "ALL") {
    const gid = Number(g);
    if (!Number.isInteger(gid)) return NextResponse.json({ error: "Invalid guild" }, { status: 400 });
    q = q.eq("guild_id", gid);
  }
  const { data, error } = await q.order("stage", { ascending: false, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: me } = await admin
    .from("members")
    .select("id, guild_id, is_admin, is_super_admin, is_creator")
    .eq("id", auth.member.id)
    .maybeSingle();
  const { data: all } = await admin.from("members").select("username");
  const claimed = new Set((all ?? []).map((m: any) => (m.username || "").toLowerCase()));
  const { data: ro } = await admin.from("roster").select("*");
  const gid2 = g && g !== "ALL" ? Number(g) : null;
  const extra = (ro ?? [])
    .filter((r: any) => !claimed.has(r.key) && (gid2 === null || r.guild_id === null || r.guild_id === gid2))
    .map((r: any) => ({ id: "roster-" + r.key, username: r.name, avatar_url: null, promotion_tier: r.promotion_tier, level: r.level, stage: r.stage, dv_map: r.dv_map, gr_boss: r.gr_boss, guild_id: r.guild_id }));
  const members = [...(data ?? []), ...extra].sort((a: any, b: any) => (b.promotion_tier ?? 0) - (a.promotion_tier ?? 0) || (b.stage ?? 0) - (a.stage ?? 0) || (b.level ?? 0) - (a.level ?? 0));
  return NextResponse.json({
    me: auth.member.id,
    roles: { guild_id: me?.guild_id ?? null, is_creator: !!me?.is_creator, is_admin: !!me?.is_admin, is_super_admin: !!me?.is_super_admin },
    members,
  });
}
