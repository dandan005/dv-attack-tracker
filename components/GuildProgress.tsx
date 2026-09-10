"use client";

import { PixelPanel, PixelHeader } from "./PixelPanel";

export type MemberRow = {
  discord_id: string;
  username: string;
  avatar_url: string | null;
  logged: boolean[];
  score: number;
  bestPromotion: number | null;
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
  const raidScore = members.reduce((sum, member) => sum + member.score, 0);
  const missCount = (member: MemberRow) => member.logged.slice(0, currentDay).filter((logged) => !logged).length;
  const perfectCount = members.filter((member) => missCount(member) === 0).length;
  const completeCycle = members.filter((member) => member.logged.every(Boolean)).length;
  const topDamage = members.reduce<MemberRow | null>((top, member) => (!top || member.score > top.score ? member : top), null);
  const you = currentUserId ? members.find((member) => member.discord_id === currentUserId) : undefined;

  return (
    <PixelPanel className="mb-5 animate-rise">
      <PixelHeader icon="⚔️" title="GUILD PROGRESS" right={<span className="text-[10px] bg-dv-bg/25 text-dv-bg px-2 py-1 pixel-frame">{total} MEMBERS</span>} />

      <div className="pixel-frame border border-dv-line bg-dv-bg/70 p-3 mb-4">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <p className="eyebrow">DAY {currentDay} READOUT</p>
            <p className="text-[12px] text-dv-brassLight mt-1">{doneToday}/{total} members checked in</p>
          </div>
          <span className="text-lg text-dv-emerald">{percentToday}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: percentToday + "%" }} /></div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
          <div><p className="text-slate-300/45">RAID POINTS</p><p className="text-dv-brassLight mt-1">{raidScore.toLocaleString()}</p></div>
          <div className="text-right"><p className="text-slate-300/45">TOP DAMAGE</p><p className="text-dv-emerald mt-1">{topDamage && topDamage.score > 0 ? topDamage.username + " · " + topDamage.score.toLocaleString() : "NO SCORES YET"}</p></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-[10px]">
          <div className="text-dv-emerald">{completeCycle} CLEAR</div>
          <div className="text-dv-brassLight">{perfectCount} CLEAN</div>
          <div className="text-dv-ember text-right">{missingToday} PENDING</div>
        </div>
        {you && <p className={missCount(you) > 0 ? "text-[10px] text-dv-ember mt-3" : "text-[10px] text-dv-emerald mt-3"}>{missCount(you) > 0 ? "YOUR RUN HAS " + missCount(you) + " MISS" + (missCount(you) === 1 ? "" : "ES") : "YOUR RUN IS CLEAN SO FAR"}{you.score > 0 ? " · " + you.score.toLocaleString() + " POINTS" : ""}</p>}
      </div>

      {total === 0 ? (
        <div className="item-slot px-3 py-5 text-center text-[10px] text-slate-300/55">NO GUILD MEMBERS HAVE JOINED YET.</div>
      ) : (
        <div className="mb-2">
          <div className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 text-center text-[10px] text-dv-brassLight mb-2">
            <div className="text-left">ROSTER</div>
            {[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={day === currentDay ? "text-dv-emerald" : ""}>D{day}</div>)}
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {members.map((member) => (
              <div key={member.discord_id} className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 items-center" title={member.score > 0 ? member.username + " · " + member.score.toLocaleString() + " raid points" : member.username}>
                <div className="flex items-center gap-1 min-w-0 pr-1">
                  <img src={member.avatar_url ?? "/icons/icon-192.png"} alt="" className="w-5 h-5 pixel-frame border border-dv-line shrink-0" />
                  <div className="min-w-0"><span className="block text-[10px] truncate text-slate-200/80">{member.username}</span><span className="block text-[9px] truncate text-slate-300/35">{member.score > 0 ? member.score.toLocaleString() + " pts" : "no score"}</span></div>
                </div>
                {member.logged.map((done, index) => {
                  const dayNum = index + 1;
                  const isToday = dayNum === currentDay;
                  const isFuture = dayNum > currentDay;
                  return <div key={index} className={["aspect-square pixel-frame flex items-center justify-center text-[11px] font-bold", index === 3 ? "border-l border-dv-line" : "", done ? "bg-dv-emerald text-dv-bg" : isFuture ? "bg-dv-panel2 text-slate-300/20" : isToday ? "bg-dv-panel2 border border-dv-brass text-dv-brassLight" : "bg-dv-ember/80 text-dv-bg"].join(" ")}>{done ? "✓" : isFuture ? "·" : isToday ? "–" : "✕"}</div>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onPingMissing} disabled={missingToday === 0 || pinging} className="mt-4 w-full pixel-frame bg-dv-ember disabled:bg-dv-panel2 disabled:text-slate-300/35 disabled:border-dv-line text-dv-bg text-[10px] py-3 shadow-pixel-sm active:translate-y-[2px] hover:bg-dv-brassLight transition-colors">
        {missingToday === 0 ? "EVERYONE IS CHECKED IN FOR TODAY" : pinging ? "SENDING RAID SIGNAL..." : "PING " + missingToday + " PENDING MEMBER" + (missingToday > 1 ? "S" : "")}
      </button>
    </PixelPanel>
  );
}
