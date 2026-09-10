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
      const identityData = (identity?.identity_data ?? {}) as Record<string, any>;
      const userMetadata = (data.user.user_metadata ?? {}) as Record<string, any>;
      const discordId = identityData.provider_id ?? identityData.sub ?? data.user.id;
      const displayName =
        identityData.global_name ??
        identityData.custom_claims?.global_name ??
        userMetadata.global_name ??
        userMetadata.display_name ??
        identityData.display_name ??
        userMetadata.full_name ??
        identityData.full_name ??
        userMetadata.name ??
        identityData.name ??
        data.user.email ??
        "Slayer";
      const avatarUrl = identityData.avatar_url ?? userMetadata.avatar_url ?? null;

      // upsert into members table so the guild roster is populated on first login
      const admin = createAdminClient();
      await admin.from("members").upsert(
        {
          auth_user_id: data.user.id,
          discord_id: discordId,
          username: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: "auth_user_id" }
      );

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
