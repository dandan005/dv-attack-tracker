"use client";

import { PixelPanel, PixelHeader } from "./PixelPanel";

export type MemberRow = {
  discord_id: string;
  username: string;
  avatar_url: string | null;
  logged: boolean[]; // length 6, index 0 = D1
};

export function GuildProgress({
  members,
  onPingMissing,
  pinging,
  currentDay = 6,
  currentUserId,
}: {
  members: MemberRow[];
  onPingMissing: () => void;
  pinging: boolean;
  currentDay?: number; // 1-6, which day the cycle is currently on
  currentUserId?: string; // discord_id of the logged-in user, for "YOU MISS" stat
}) {
  const missingCount = members.filter((m) => m.logged.some((l) => !l)).length;
  const total = members.length;

  const doneToday = members.filter((m) => m.logged[currentDay - 1]).length;
  const pendingToday = total - doneToday;
  const percentToday = total > 0 ? Math.round((doneToday / total) * 100) : 0;

  const missCount = (m: MemberRow) =>
    m.logged.slice(0, currentDay).filter((l) => !l).length;

  const perfectCount = members.filter((m) => missCount(m) === 0).length;

  const mostMisses = members.reduce<MemberRow | null>((worst, m) => {
    if (!worst) return m;
    return missCount(m) > missCount(worst) ? m : worst;
  }, null);

  const you = currentUserId ? members.find((m) => m.discord_id === currentUserId) : undefined;

  return (
    <PixelPanel className="mb-4 animate-rise">
      <PixelHeader
        icon="🐉"
        title="GUILD PROGRESS"
        right={
          <span className="text-[10px] bg-dv-bg text-dv-brassLight px-2 py-1 pixel-frame">
            {total} members
          </span>
        }
      />

      {/* stat summary banner */}
      <div className="pixel-frame pixel-border bg-dv-bg px-3 py-3 mb-4 text-[10px] leading-relaxed">
        <div className="text-dv-brassLight">
          D{currentDay} {doneToday}/{total} ({percentToday}%) PEND {pendingToday} MISS{" "}
          {total - doneToday - pendingToday >= 0 ? missingCount : 0}
        </div>
        <div className="text-dv-brassLight">
          PERFECT {perfectCount}
          {mostMisses && missCount(mostMisses) > 0 ? (
            <> MOST MISS: {mostMisses.username} ({missCount(mostMisses)})</>
          ) : null}
        </div>
        {you ? (
          <div className={missCount(you) > 0 ? "text-dv-ember" : "text-dv-emerald"}>
            YOU MISS {missCount(you)}
          </div>
        ) : null}
      </div>

      {/* checklist grid */}
      <div className="mb-2">
        <div className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 text-center text-[8px] text-dv-brassLight mb-1">
          <div />
          <div className="col-span-3">D1–D3</div>
          <div className="col-span-3 border-l border-dv-brass pl-1">D4–D6</div>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {members.map((m) => (
            <div
              key={m.discord_id}
              className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 items-center"
            >
              <div className="flex items-center gap-1 min-w-0">
                <img
                  src={m.avatar_url ?? "/icons/icon-192.png"}
                  alt=""
                  className="w-5 h-5 pixel-frame border border-dv-brass shrink-0"
                />
                <span className="text-[8px] truncate">{m.username}</span>
              </div>

              {m.logged.map((done, i) => {
                const dayNum = i + 1;
                const isPast = dayNum < currentDay;
                const isToday = dayNum === currentDay;
                const isFuture = dayNum > currentDay;

                return (
                  <div
                    key={i}
                    className={`aspect-square pixel-frame flex items-center justify-center text-[10px] font-bold ${
                      i === 3 ? "border-l border-dv-brass" : ""
                    } ${
                      done
                        ? "bg-dv-emerald text-dv-bg"
                        : isFuture
                        ? "bg-dv-panel2"
                        : isToday
                        ? "bg-dv-panel2 border border-dv-brass text-dv-brassLight"
                        : "bg-dv-ember text-dv-bg"
                    }`}
                  >
                    {done ? "✓" : isFuture ? "" : isToday ? "–" : "✕"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onPingMissing}
        disabled={missingCount === 0 || pinging}
        className="mt-2 w-full pixel-frame bg-dv-ember disabled:bg-dv-brass disabled:opacity-60 text-dv-bg text-[10px] py-3 shadow-pixel-sm active:translate-y-[2px]"
      >
        {missingCount === 0
          ? "EVERYONE HAS AT LEAST ONE ATTACK. NICE."
          : pinging
          ? "PINGING..."
          : `PING ${missingCount} MISSING MEMBER${missingCount > 1 ? "S" : ""} ON DISCORD`}
      </button>
    </PixelPanel>
  );
}
