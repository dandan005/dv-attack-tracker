"use client";

import { PixelPanel } from "./PixelPanel";

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
      <div className="flex items-end justify-between gap-3 mb-4">
        <div><p className="eyebrow">GUILD READOUT</p><p className="text-lg text-dv-brassLight mt-1">Keep the line moving.</p></div>
        <span className="text-[10px] border border-dv-ember/50 bg-dv-ember/10 text-dv-ember px-2 py-1 pixel-frame">{missingToday} PENDING</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="item-slot p-3"><p className="eyebrow">TODAY</p><p className="text-xl text-dv-emerald mt-1">{doneToday}<span className="text-xs text-slate-300/50">/{total}</span></p></div>
        <div className="item-slot p-3"><p className="eyebrow">POINTS</p><p className="text-xl text-dv-brassLight mt-1">{raidScore.toLocaleString()}</p></div>
        <div className="item-slot p-3"><p className="eyebrow">CLEAN RUNS</p><p className="text-xl text-dv-brassLight mt-1">{completeCycle}</p></div>
      </div>
      {total === 0 ? (
        <div className="item-slot px-3 py-5 text-center text-[10px] text-slate-300/55">NO GUILD MEMBERS HAVE JOINED YET.</div>
      ) : (
        <div className="mb-2">
          <div className="grid grid-cols-[1fr_repeat(6,minmax(0,1fr))] gap-1 text-center text-[10px] text-dv-brassLight mb-2">
            <div className="text-left">ATTACK LEDGER / MEMBERS</div>
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
