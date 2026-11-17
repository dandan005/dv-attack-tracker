import { isGuildVerificationFresh } from "@/lib/discord";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const MEMBER_FIELDS = "id, auth_user_id, discord_id, username, avatar_url, guild_verified_at";

// Looks up the guild member for a signed-in user and checks verification is fresh.
async function memberFor(supabase: any, user: { id: string }) {
  const { data: member } = await supabase
    .from("members")
    .select(MEMBER_FIELDS)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) {
    return { member: null, error: "Guild membership required" };
  }

  if (!isGuildVerificationFresh(member.guild_verified_at)) {
    return { member: null, error: "Guild membership needs reauthentication" };
  }

  return { member, error: null };
}

// Browser requests use the login cookie. The native app sends its Supabase access
// token as "Authorization: Bearer <token>" instead, so both are accepted here.
export async function getGuildMember(req?: Request) {
  const bearer = req?.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (bearer) {
    const admin = createAdminClient();
    const { data: { user } } = await admin.auth.getUser(bearer);
    if (!user) {
      return { supabase: admin, user: null, member: null, error: "Not authenticated" };
    }
    const result = await memberFor(admin, user);
    return { supabase: admin, user, ...result };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, member: null, error: "Not authenticated" };
  }

  const result = await memberFor(supabase, user);
  return { supabase, user, ...result };
}
