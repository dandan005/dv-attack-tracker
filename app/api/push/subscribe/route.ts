import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

function validSub(body: any) {
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body?.keys?.auth === "string" ? body.keys.auth : "";
  if (!endpoint.startsWith("https://") || endpoint.length > 2000 || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}

export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  const sub = validSub(await req.json().catch(() => null));
  if (!sub) return NextResponse.json({ error: "Bad subscription" }, { status: 400 });
  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .upsert({ ...sub, member_id: auth.member.id }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  const body = await req.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await createAdminClient().from("push_subscriptions").delete().eq("endpoint", endpoint).eq("member_id", auth.member.id);
  return NextResponse.json({ ok: true });
}
