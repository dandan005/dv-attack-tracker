// Dragon Valley runs a 7-day attack cycle (D1-D6 active, D7 standby). The
// cycle is pinned to the same fixed real-world schedule as the calculation
// window (Sun 22:00 - Mon 07:00 UTC): Day 1 always begins at Sunday 22:00
// UTC — the same instant the calculation window begins — and Day 7
// (standby) always ends at that same moment. The calculation window is NOT
// a boundary between Day 7 and Day 1; it's the first 9 hours of Day 1
// itself, during which the UI shows the calculation card instead of Day
// 1's normal content. This is intentionally NOT configurable per guild —
// the calc window itself isn't configurable either, so the day-cycle
// anchor has to match it exactly or the two fall out of sync.

export const CYCLE_LENGTH = 7;
const CYCLE_START_UTC_HOUR = 22; // Sunday 22:00 UTC

export function getCycleInfo(anchorDateISO?: string, resetHourUTC?: number) {
  // anchorDateISO / resetHourUTC are accepted for backwards compatibility
  // with existing callers and the Settings UI, but are no longer used —
  // the cycle start is fixed to Sunday 22:00 UTC to stay in sync with the
  // calculation window. Safe to remove both params (and the Settings
  // fields for anchor date / reset hour) once nothing else depends on them.
  const now = new Date();

  const anchor = new Date();
  anchor.setUTCHours(CYCLE_START_UTC_HOUR, 0, 0, 0);
  const dayOfWeek = anchor.getUTCDay(); // 0 = Sunday
  anchor.setUTCDate(anchor.getUTCDate() - dayOfWeek);
  if (anchor.getTime() > now.getTime()) {
    anchor.setUTCDate(anchor.getUTCDate() - 7);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - anchor.getTime()) / msPerDay);
  const cycleIndex = Math.floor(diffDays / CYCLE_LENGTH);
  const dayNumber = ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH; // 0-6

  const cycleStart = new Date(anchor.getTime() + cycleIndex * CYCLE_LENGTH * msPerDay);
  const dayStart = new Date(anchor.getTime() + diffDays * msPerDay);
  const dayEnd = new Date(dayStart.getTime() + msPerDay);

  return {
    dayNumber: dayNumber + 1, // 1-7 for display
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
