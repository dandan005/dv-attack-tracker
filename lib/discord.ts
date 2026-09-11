const VERIFICATION_MAX_AGE_MS = 60 * 60 * 1000;

export function isGuildVerificationFresh(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false;
  return Date.now() - new Date(timestamp).getTime() < VERIFICATION_MAX_AGE_MS;
}

export async function isDiscordGuildMember(accessToken: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) throw new Error("Discord guild verification is not configured");

  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${encodeURIComponent(guildId)}/member`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Discord membership check failed (${response.status})`);
  }

  return true;
}
