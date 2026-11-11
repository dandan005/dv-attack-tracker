import { NextRequest, NextResponse } from "next/server";
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";
import { createAdminClient } from "@/lib/supabase/server";
import { getCycleInfo } from "@/lib/cycle";
import { serverLog } from "@/lib/appLog";

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 401 },
    );
  }

  const rawBody = await req.text();
  const isValidRequest = await verifyKey(
    rawBody,
    signature,
    timestamp,
    DISCORD_PUBLIC_KEY,
  );

  if (!isValidRequest) {
    return NextResponse.json(
      { error: "Invalid request signature" },
      { status: 401 },
    );
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data, member: discordMember } = body;

  // Handle Discord PING handshake
  if (type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Handle Button Clicks (Message Components)
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const customId = data?.custom_id;

    // Check if button custom_id starts with our prefix
    if (customId?.startsWith("log_attack_guild_")) {
      const discordUserId = discordMember?.user?.id;
      const discordUsername = discordMember?.user?.username || "Warrior";

      if (!discordUserId) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "❌ Could not identify your Discord account.",
            flags: 64,
          },
        });
      }

      // Extract the target guild identifier from custom_id (e.g., "1" or "2")
      const targetGuildCode = customId.replace("log_attack_guild_", "");

      const supabase = createAdminClient();

      // Verify member exists in database via discord_id and the guild_id
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select(
          `
            id,
            guild_id,
            game_name,
            guilds!inner (
              id,
              code
            )
          `,
        )
        .eq("discord_id", discordUserId)
        .eq("guilds.code", targetGuildCode)
        .maybeSingle();

      if (memberError || !memberData) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ **${discordUsername}**, you are not registered or authenticated in the guild database. Please contact an admin to link your Discord ID.`,
            flags: 64,
          },
        });
      }

      if (!memberData.guild_id) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `⚠️ Ask an admin to assign you to a guild first before logging attacks.`,
            flags: 64,
          },
        });
      }

      // Get current attack cycle info
      const { cycleStartISO, dayNumber: today } = getCycleInfo();

      if (today < 1 || today > 6) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `⚠️ Unable to log attack: Current cycle day (${today}) is out of bounds (1-6).`,
            flags: 64,
          },
        });
      }

      // Log the attack into attack_logs table
      const { error: logError } = await supabase.from("attack_logs").upsert(
        {
          member_id: memberData.id,
          day_number: today,
          cycle_start: cycleStartISO,
          logged_at: new Date().toISOString(),
          promotion_tier: null,
          damage_score: null,
        },
        {
          onConflict: "member_id,day_number,cycle_start",
          ignoreDuplicates: true,
        },
      );

      if (logError) {
        await serverLog(
          "error",
          "discord-log-attack",
          logError.message,
          { day: today },
          memberData.id,
        );

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Failed to log attack: ${logError.message}`,
            flags: 64,
          },
        });
      }

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚔️ **${memberData.game_name}** successfully logged today's attack for **Day ${today}**!`,
          flags: 64, // Uncomment if you only want the response visible to the clicker
        },
      });
    }
  }

  return NextResponse.json({ error: "Unknown interaction" }, { status: 400 });
}
