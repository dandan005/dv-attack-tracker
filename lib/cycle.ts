// Dragon Valley runs a 7-day attack cycle (D1-D6 active, D7 standby).
// Day 1 always begins at 14:00 UTC on Monday (displayed in-game as
// 10:00 PM PHT, since the guild operates on Manila time, UTC+8).
// Day 7 therefore spans Sunday 14:00 UTC -> Monday 14:00 UTC, and breaks
// into three fixed real-world phases within that span:
//   - Calculation:     Sun 14:00 - 23:00 UTC (9h)  -> Sun 10pm - Mon 7am PHT
//   - Ranking Results: Sun 23:00 - Mon 00:00 UTC (1h) -> Mon 7:01am - 8:00am PHT
//   - Onboarding:      Mon 00:00 - 14:00 UTC (14h) -> Mon 8:01am - 9:59pm PHT
// None of this is configurable per guild — the day-cycle anchor and the
// phase windows have to stay pinned to each other or they fall out of sync.
// (Previously the anchor was manually configurable per guild via Settings;
// that caused stored day_number/cycle_start values to drift out of sync
// with this fixed schedule. The anchor is now hardcoded — do not
// reintroduce a configurable anchor without also migrating stored rows.)

export const CYCLE_LENGTH = 7;
const CYCLE_START_UTC_HOUR = 14; // 14:00 UTC = 10:00 PM PHT
const CYCLE_START_UTC_WEEKDAY = 1; // 0=Sun, 1=Mon
const RANKING_RESULTS_START_HOUR = 23; // Sun 23:00 UTC = Mon 7:01am PHT boundary

export function getCycleInfo() {
  const now = new Date();

  const anchor = new Date();
  anchor.setUTCHours(CYCLE_START_UTC_HOUR, 0, 0, 0);
  const dayOfWeek = anchor.getUTCDay();
  const daysSinceAnchorWeekday = (dayOfWeek - CYCLE_START_UTC_WEEKDAY + 7) % 7;
  anchor.setUTCDate(anchor.getUTCDate() - daysSinceAnchorWeekday);
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

export type Day7Phase = "calculation" | "ranking-results" | "onboarding" | null;

export function getDay7Phase(now: Date): { phase: Day7Phase; hoursLeft: number; minutesLeft: number; msLeft: number } {
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  const hour = now.getUTCHours();

  const msLeftUntil = (end: Date) => Math.max(0, end.getTime() - now.getTime());
  const toLefts = (ms: number) => ({
    hoursLeft: Math.ceil(ms / (60 * 60 * 1000)),
    minutesLeft: Math.ceil(ms / (60 * 1000)),
    msLeft: ms,
  });

  if (day === 0 && hour >= CYCLE_START_UTC_HOUR && hour < RANKING_RESULTS_START_HOUR) {
    const end = new Date(now);
    end.setUTCHours(RANKING_RESULTS_START_HOUR, 0, 0, 0);
    return { phase: "calculation", ...toLefts(msLeftUntil(end)) };
  }

  if (day === 0 && hour >= RANKING_RESULTS_START_HOUR) {
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCHours(0, 0, 0, 0);
    return { phase: "ranking-results", ...toLefts(msLeftUntil(end)) };
  }

  if (day === 1 && hour < CYCLE_START_UTC_HOUR) {
    const end = new Date(now);
    end.setUTCHours(CYCLE_START_UTC_HOUR, 0, 0, 0);
    return { phase: "onboarding", ...toLefts(msLeftUntil(end)) };
  }

  return { phase: null, hoursLeft: 0, minutesLeft: 0, msLeft: 0 };
}
