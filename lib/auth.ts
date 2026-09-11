import { isGuildVerificationFresh } from "@/lib/discord";
import { createClient } from "@/lib/supabase/server";

export async function getGuildMember() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, member: null, error: "Not authenticated" };
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, auth_user_id, discord_id, username, avatar_url, guild_verified_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) {
    return { supabase, user, member: null, error: "Guild membership required" };
  }

  if (!isGuildVerificationFresh(member.guild_verified_at)) {
    return { supabase, user, member: null, error: "Guild membership needs reauthentication" };
  }

  return { supabase, user, member, error: null };
}
