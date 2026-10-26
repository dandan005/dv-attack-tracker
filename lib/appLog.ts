import { createAdminClient } from "@/lib/supabase/server";
import { scrubLog } from "@/lib/logScrub";

// Server-side error log. Never throws, so logging can't break the request that called it.
const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export async function serverLog(level: "error" | "warn" | "info", source: string, message: string, details?: unknown, memberId?: string | null) {
  try {
    await createAdminClient().from("app_logs").insert({
      level,
      source: clip(source, 60),
      message: scrubLog(clip(message, 500)),
      details: details == null ? null : scrubLog(clip(JSON.stringify(details), 2000)),
      member_id: memberId ?? null,
    });
  } catch (e) {
    // A failed log must not fail the request, but leave a trace in the server console.
    console.error("serverLog failed", e);
  }
}
