import { createAdminClient } from "@/lib/supabase/server";

// Server-side error log. Never throws, so logging can't break the request that called it.
const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export async function serverLog(level: "error" | "warn" | "info", source: string, message: string, details?: unknown, memberId?: string | null) {
  try {
    await createAdminClient().from("app_logs").insert({
      level,
      source: clip(source, 60),
      message: clip(message, 500),
      details: details == null ? null : clip(JSON.stringify(details), 2000),
      member_id: memberId ?? null,
    });
  } catch {
    // ignore: a failed log must not fail the request
  }
}
