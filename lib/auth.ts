import { isDiscordGuildMember } from "@/lib/discord";
import { createClient } from "@/lib/supabase/server";

export async function getGuildMember() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, member: null, error: "Not authenticated" };
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, auth_user_id, discord_id, username, avatar_url")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) {
    return { supabase, user, member: null, error: "Guild membership required" };
  }

  try {
    if (!(await isDiscordGuildMember(member.discord_id))) {
      return { supabase, user, member: null, error: "Guild membership required" };
    }
  } catch {
    return { supabase, user, member: null, error: "Guild membership could not be verified" };
  }

  return { supabase, user, member, error: null };
}
