import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const g = req.nextUrl.searchParams.get("guild");
  let q = createAdminClient()
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
  return NextResponse.json({ me: auth.member.id, members: data ?? [] });
}
