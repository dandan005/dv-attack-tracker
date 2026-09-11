export async function isDiscordGuildMember(discordId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    throw new Error("Discord guild verification is not configured");
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordId)}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    }
  );

  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Discord membership check failed (${response.status})`);
  }

  return true;
}
