// Browser-side error reporter. Fire-and-forget; never throws and never logs its own failures (avoids loops).
export function clientLog(source: string, message: string, details?: unknown, level: "error" | "warn" | "info" = "error") {
  try {
    fetch("/api/app-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, source, message: String(message ?? ""), details }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
