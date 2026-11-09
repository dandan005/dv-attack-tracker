import { NextRequest, NextResponse } from "next/server";
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";

const DISCORD_PUBLIC_KEY =
  process.env.DISCORD_PUBLIC_KEY || "YOUR_CLIENT_PUBLIC_KEY";

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
    console.error(
      "[discord-interactions] Invalid signature verification failed.",
    );
    return NextResponse.json(
      { error: "Invalid request signature" },
      { status: 401 },
    );
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    console.error("[discord-log-attack] Failed to parse request body:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data, member } = body;
  console.log("[discord-log-attack] Verified request received:", {
    type,
    data,
    member,
  });

  // Handle Discord PING handshake
  if (type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Handle Message Component (Buttons/Select menus)
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const customId = data?.custom_id;

    if (customId === "attack_button") {
      console.log(
        `Attack initiated by user: ${member?.user?.username} (${member?.user?.id})`,
      );

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `⚔️ **${member?.user?.username || "A warrior"}** launched an attack!`,
          // flags: 64, // Uncomment if you only want the response visible to the clicker
        },
      });
    }
  }

  return NextResponse.json(
    { error: "Unknown interaction type" },
    { status: 400 },
  );
}
