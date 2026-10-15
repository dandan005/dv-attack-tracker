import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  }

  const body = await req.json();
  const tier = Number(body.promotionTier);
  if (!Number.isInteger(tier) || tier < 0) {
    return NextResponse.json({ error: "Invalid promotion tier" }, { status: 400 });
  }

  const { error } = await createAdminClient().from("members").update({ promotion_tier: tier }).eq("id", auth.member.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
