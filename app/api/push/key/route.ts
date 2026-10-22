import { NextResponse } from "next/server";

// Public VAPID key the browser needs to subscribe. Not a secret.
export async function GET() {
  return NextResponse.json({ key: process.env.VAPID_PUBLIC_KEY ?? null });
}
