"use client";

import { PixelPanel, PixelHeader } from "./PixelPanel";

export type MemberRow = {
  discord_id: string;
  username: string;
  avatar_url: string | null;
  logged: boolean[];
};

export function GuildProgress({
  members,
  onPingMissing,
  pinging,
  currentDay = 1,
  currentUserId,
}: {
  members: MemberRow[];
  onPingMissing: () => void;
  pinging: boolean;
  currentDay?: number;
  currentUserId?: string;
}) {
  const total = members.length;
  const doneToday = members.filter((m) => m.logged[currentDay - 1]).length;
  const missingToday = members.filter((m) => !m.logged[currentDay - 1]).length;
  const percentToday = total > 0 ? Math.round((doneToday / total) * 100) : 0;
  const missCount = (m: MemberRow) => m.logged.slice(0, currentDay).filter((l) => !l).length;
  const perfectCount = members.filter((m) => missCount(m) === 0).length;
  const completeCycle = members.filter((m) => m.logged.every(Boolean)).length;
  const mostMisses = members.reduce<MemberRow | null>((worst, m) => (!worst || missCount(m) > missCount(worst) ? m : worst), null);
  const you = currentUserId ? members.find((m) => m.discord_id === currentUserId) : undefined;

  return (
    <PixelPanel className="mb-5 animate-rise">
      <PixelHeader
        icon="⚔️"
        title="GUILD PROGRESS"
        right={<span className="text-[8px] bg-dv-bg/25 text-dv-bg px-2 py-1 pixel-frame">{total} MEMBERS</span>}
      />

      <div className="pixel-frame border border-dv-line bg-dv-bg/70 p-3 mb-4">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <p className="eyebrow">DAY {currentDay} READOUT</p>
            <p className="text-[11px] text-dv-brassLight mt-1">{doneToday}/{total} members checked in</p>
          </div>
          <span className="text-lg text-dv-emerald">{percentToday}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: percentToday + "%" }} /></div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-[8px]">
          <div className="text-dv-emerald">{completeCycle} CLEAR</div>
          <div className="text-dv-brassLight">{perfectCount} CLEAN</div>
          <div className="text-dv-ember text-right">{missingToday} PENDING</div>
        </div>
        {you && <p className={missCount(you) > 0 ? "text-[8px] text-dv-ember mt-3" : "text-[8px] text-dv-emerald mt-3"}>{missCount(you) > 0 ? "YOUR RUN HAS " + missCount(you) + " MISS" + (missCount(you) === 1 ? "" : "ES") : "YOUR RUN IS CLEAN SO FAR"}</p>}
        {mostMisses && missCount(mostMisses) > 0 && <p className="text-[8px] text-slate-300/50 mt-2">MOST MISSES · {mostMisses.username} ({missCount(mostMisses)})</p>}
      </div>

      {total === 0 ? (
        <div className="item-slot px-3 py-5 text-center text-[9px] text-slate-300/55">NO GUILD MEMBERS HAVE JOINED YET.</div>
      ) : (
        <div className="mb-2">
          <div className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 text-center text-[8px] text-dv-brassLight mb-2">
            <div className="text-left">ROSTER</div>
            {[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={day === currentDay ? "text-dv-emerald" : ""}>D{day}</div>)}
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {members.map((m) => (
              <div key={m.discord_id} className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 items-center">
                <div className="flex items-center gap-1 min-w-0 pr-1">
                  <img src={m.avatar_url ?? "/icons/icon-192.png"} alt="" className="w-5 h-5 pixel-frame border border-dv-line shrink-0" />
                  <span className="text-[8px] truncate text-slate-200/80">{m.username}</span>
                </div>
                {m.logged.map((done, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === currentDay;
                  const isFuture = dayNum > currentDay;
                  return (
                    <div key={i} className={["aspect-square pixel-frame flex items-center justify-center text-[10px] font-bold", i === 3 ? "border-l border-dv-line" : "", done ? "bg-dv-emerald text-dv-bg" : isFuture ? "bg-dv-panel2 text-slate-300/20" : isToday ? "bg-dv-panel2 border border-dv-brass text-dv-brassLight" : "bg-dv-ember/80 text-dv-bg"].join(" ")}>
                      {done ? "✓" : isFuture ? "·" : isToday ? "–" : "✕"}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onPingMissing}
        disabled={missingToday === 0 || pinging}
        className="mt-4 w-full pixel-frame bg-dv-ember disabled:bg-dv-panel2 disabled:text-slate-300/35 disabled:border-dv-line text-dv-bg text-[9px] py-3 shadow-pixel-sm active:translate-y-[2px] hover:bg-dv-brassLight transition-colors"
      >
        {missingToday === 0 ? "EVERYONE IS CHECKED IN FOR TODAY" : pinging ? "SENDING RAID SIGNAL..." : "PING " + missingToday + " PENDING MEMBER" + (missingToday > 1 ? "S" : "")}
      </button>
    </PixelPanel>
  );
}
