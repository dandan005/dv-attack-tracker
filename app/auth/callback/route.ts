import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const identity = data.user.identities?.find((i) => i.provider === "discord");
      const discordId = identity?.identity_data?.provider_id ?? data.user.id;
      const username =
        identity?.identity_data?.full_name ??
        identity?.identity_data?.name ??
        data.user.email ??
        "Slayer";
      const avatarUrl = identity?.identity_data?.avatar_url ?? null;

      // upsert into members table so the guild roster is populated on first login
      const admin = createAdminClient();
      await admin.from("members").upsert(
        {
          auth_user_id: data.user.id,
          discord_id: discordId,
          username,
          avatar_url: avatarUrl,
        },
        { onConflict: "auth_user_id" }
      );

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
