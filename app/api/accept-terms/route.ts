import { NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/terms";

// Records that the signed-in member agreed to this version of the terms and privacy policy.
export async function POST() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await createAdminClient()
    .from("members")
    .update({ terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() })
    .eq("id", auth.member.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, version: TERMS_VERSION });
}
