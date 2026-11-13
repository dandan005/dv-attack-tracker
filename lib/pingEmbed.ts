export type PingKind = "live" | "checkin" | "last";

const COLORS: Record<PingKind, number> = { live: 0x3ba55d, checkin: 0x4f9cf9, last: 0xf0b232 };

export function kindFromHour(hour: number): PingKind {
  return hour === 14 ? "live" : hour === 13 ? "last" : "checkin";
}

export function kindFromColor(color?: number): PingKind {
  return color === COLORS.live ? "live" : color === COLORS.last ? "last" : "checkin";
}

function nextResetUnix(): number {
  const now = new Date();
  let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 14);
  if (t <= now.getTime()) t += 24 * 60 * 60 * 1000;
  return Math.floor(t / 1000);
}

export function buildPingEmbed(o: { kind: PingKind; day: number; total: number; logged: number; guildCode: string }) {
  const left = Math.max(o.total - o.logged, 0);
  const pct = o.total ? Math.round((o.logged / o.total) * 100) : 0;
  let filled = o.total ? Math.round((o.logged / o.total) * 12) : 0;
  if (left > 0) filled = Math.min(filled, 11);
  const bar = "▰".repeat(filled) + "▱".repeat(12 - filled);
  const title =
    o.kind === "live" ? `D${o.day} is live: ${left} still to log`
    : o.kind === "last" ? `LAST CALL: D${o.day} resets in 1 hour (${left} left)`
    : `D${o.day} check-in: still waiting on ${left}`;
  return {
    color: COLORS[o.kind],
    title,
    description: `${bar} **${o.logged}/${o.total}** · ${pct}%\nDay ${o.day}/6 · resets <t:${nextResetUnix()}:R>`,
  };
}
