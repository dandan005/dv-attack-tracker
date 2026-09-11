// Dragon Valley runs a 6-day attack cycle (D1-D6). We anchor the cycle to a
// configurable start date + reset hour (UTC) so the whole guild agrees on
// "today's" day number no matter what timezone each member is in.

export const CYCLE_LENGTH = 6;

export function getCycleInfo(anchorDateISO: string, resetHourUTC: number) {
  const now = new Date();

  // Auto-anchor to the most recent Sunday at resetHourUTC (e.g. 14:00 UTC =
  // 10:00 PM PHT). anchorDateISO is no longer used for the calculation —
  // kept as a param so callers / the Settings UI don't need to change —
  // but you can drop it later if you remove the anchor date field.
  const anchor = new Date();
  anchor.setUTCHours(resetHourUTC, 0, 0, 0);
  const dayOfWeek = anchor.getUTCDay(); // 0 = Sunday
  anchor.setUTCDate(anchor.getUTCDate() - dayOfWeek);
  if (anchor.getTime() > now.getTime()) {
    anchor.setUTCDate(anchor.getUTCDate() - 7);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - anchor.getTime()) / msPerDay);
  const cycleIndex = Math.floor(diffDays / CYCLE_LENGTH);
  const dayNumber = ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH; // 0-5

  const cycleStart = new Date(anchor.getTime() + cycleIndex * CYCLE_LENGTH * msPerDay);
  const dayStart = new Date(anchor.getTime() + diffDays * msPerDay);
  const dayEnd = new Date(dayStart.getTime() + msPerDay);

  return {
    dayNumber: dayNumber + 1, // 1-6 for display
    cycleStartISO: cycleStart.toISOString().slice(0, 10),
    dayEnd,
    msUntilReset: dayEnd.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
