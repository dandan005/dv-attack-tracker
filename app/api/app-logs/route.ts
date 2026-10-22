import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getGuildMember } from "@/lib/auth";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);
const LEVELS = ["error", "warn", "info"];

// Any signed-in user can report an error. Only the creator can read the log.
export async function POST(req: NextRequest) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { error } = await createAdminClient().from("app_logs").insert({
    level: LEVELS.includes(body.level) ? body.level : "error",
    source: clip(body.source, 60),
    message: clip(body.message, 500),
    details: body.details == null ? null : clip(JSON.stringify(body.details), 2000),
    member_id: null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data: me } = await admin.from("members").select("is_creator").eq("id", auth.member.id).maybeSingle();
  if (!me?.is_creator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await admin
    .from("app_logs")
    .select("id, created_at, level, source, message, details")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] });
}
