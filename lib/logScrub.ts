// Removes things that should never sit in a log: tokens, keys, emails and URL query strings.
export function scrubLog(value: string): string {
  return value
    .replace(/https?:\/\/[^\s?]+\?[^\s]*/g, (url) => url.split("?")[0] + "?[redacted]")
    .replace(/[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}/g, "[redacted-token]")
    .replace(/[A-Za-z0-9_\-+/=]{32,}/g, "[redacted-key]")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted-email]");
}
