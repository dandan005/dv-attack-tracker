"use client";

import { PixelPanel } from "./PixelPanel";
import { rankByTier, rankImg } from "@/lib/ranks";
import { gameAvatar } from "@/lib/gameAvatars";

export type MemberRow = {
  id?: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  custom_avatar?: string | null;
  logged: boolean[];
  guild_id?: number | null;
  promotion_tier?: number | null;
  stage?: number | null;
  level?: number | null;
};

export function GuildProgress({
  members,
  onPingMissing,
  headerExtra,
  guildStats,
  onMark,
  savingMarks,
  pinging,
  currentDay = 1,
  currentUserId,
  onSetTier,
  showReadout = true,
}: {
  showReadout?: boolean;
  members: MemberRow[];
  onPingMissing?: () => void;
  headerExtra?: React.ReactNode;
  guildStats?: { signed: number; total: number } | null;
  onMark?: (memberId: string, day: number, done: boolean) => void;
  savingMarks?: Record<string, boolean>;
  pinging: boolean;
  currentDay?: number;
  currentUserId?: string;
  onSetTier?: (value: string) => void;
}) {
  const total = members.length;
  const doneToday = members.filter((m) => m.logged[currentDay - 1]).length;
  const missingToday = members.filter((m) => !m.logged[currentDay - 1]).length;
  const completeCycle = members.filter((member) => member.logged.every(Boolean)).length;
  const loggedTotal = members.reduce((s, m) => s + m.logged.filter(Boolean).length, 0);
  const onTrackPct = total === 0 ? 0 : Math.round((loggedTotal / (total * currentDay)) * 100);
  const atRisk = members.filter((m) => !m.logged.some(Boolean)).length;

  return (
    <>{showReadout && <PixelPanel className="animate-rise">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div><p className="eyebrow">GUILD READOUT</p><p className="text-lg text-dv-brassLight mt-1">Keep the line moving.</p>{guildStats && <p className="eyebrow mt-1 text-[#fdf3dc]">{guildStats.signed} OF {guildStats.total} SIGNED IN</p>}</div>
        <span className="text-[10px] border border-dv-ember/50 bg-dv-ember/10 text-dv-ember px-2 py-1 pixel-frame">{missingToday} PENDING</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="item-slot p-3"><p className="eyebrow">TODAY</p><p className="text-xl text-dv-emerald mt-1">{doneToday}<span className="text-xs text-[#fdf3dc]">/{total}</span></p></div>
        <div className="item-slot p-3"><p className="eyebrow">CLEAN RUNS</p><p className="text-xl text-dv-brassLight mt-1">{completeCycle}</p></div>
<div className="item-slot p-3"><p className="eyebrow">CYCLE RATE</p><p className="text-xl text-dv-brassLight mt-1">{onTrackPct}<span className="text-xs text-[#fdf3dc]">%</span></p></div>
<div className="item-slot p-3"><p className="eyebrow">NO LOGS YET</p><p className="text-xl text-dv-ember mt-1">{atRisk}<span className="text-xs text-[#fdf3dc]">/{total}</span></p></div>
      </div>
<div className="mb-4"><p className="eyebrow mb-2">CHECK-INS BY DAY</p><div className="grid grid-cols-6 gap-1">{[1, 2, 3, 4, 5, 6].map((d) => { const c = members.filter((m) => m.logged[d - 1]).length; const pct = total === 0 ? 0 : Math.round((c / total) * 100); return (<div key={d} className="flex flex-col items-center gap-0.5"><div className="relative h-8 w-full bg-dv-panel2 pixel-frame overflow-hidden"><div className="water-fill absolute bottom-0 w-full" style={{ height: pct + "%" }}><span className="water-wave" /><span className="water-wave water-wave-2" /></div><span className="absolute inset-0 z-10 flex items-center justify-center text-[9px] text-white" style={{ textShadow: "0 1px 0 #0c0704" }}>{c}</span></div><span className={["text-[8px]", d === currentDay ? "text-dv-emerald" : "text-dv-brassLight/60"].join(" ")}>D{d}</span></div>); })}</div></div>
</PixelPanel>}<PixelPanel className="animate-rise mt-3 mb-3">
      {total === 0 ? (
        <div className="item-slot px-3 py-5 text-center text-[10px] text-[#fdf3dc]">NO GUILD MEMBERS HAVE JOINED YET.</div>
      ) : (
        <div className="mb-2">
          <p className="eyebrow mb-2">ATTACK LEDGER / MEMBERS</p>
          {headerExtra}
          <div className="space-y-2 max-h-[66dvh] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {members.map((member) => (
              <div key={member.discord_id} className="item-slot p-2">
                <div className="flex items-center gap-2 min-w-0 mb-2">
                  <img src={(member.custom_avatar ? "/avatars/" + member.custom_avatar + ".png" : null) || gameAvatar(member.username) || member.avatar_url || "/icons/icon-192.png"} onError={(e) => { if (!e.currentTarget.src.endsWith("/icons/icon-192.png")) e.currentTarget.src = "/icons/icon-192.png"; }} alt="" className="w-7 h-7 pixel-frame border border-dv-line shrink-0 object-cover" />
                  <span className="block text-[11px] text-[#fdf3dc] break-words leading-tight">{member.username}</span>
                  {member.discord_id === currentUserId && <span className="text-[8px] text-dv-emerald shrink-0">(YOU)</span>}
                  {String(member.discord_id).startsWith("roster:") && <span className="text-[8px] text-dv-ember shrink-0">NO DISCORD</span>}
                  <span className="flex-1" />{rankByTier(member.promotion_tier) && <span className="flex items-center gap-1 text-[8px] text-dv-brassLight shrink-0"><img src={rankImg(rankByTier(member.promotion_tier)!.file)} alt="" className="h-4 w-4" />{rankByTier(member.promotion_tier)!.name}</span>}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {member.logged.map((done, index) => {
                    const dayNum = index + 1;
                    const isToday = dayNum === currentDay;
                    const isFuture = dayNum > currentDay;
                    return (
                      <div key={index} onClick={onMark && member.id && dayNum <= currentDay ? () => onMark(member.id!, dayNum, !done) : undefined} className={"flex flex-col items-center gap-0.5" + (onMark && member.id && dayNum <= currentDay ? " cursor-pointer" : "")}>
                        <span className={["text-[8px]", isToday ? "text-dv-emerald" : "text-dv-brassLight/60"].join(" ")}>D{dayNum}</span>
                        <div className={["h-5 w-full pixel-frame flex items-center justify-center text-[9px] leading-none font-bold", done ? "bg-dv-emerald text-dv-bg" : isFuture ? "bg-dv-panel2 text-[#fdf3dc]" : isToday ? "bg-dv-panel2 border border-dv-brass text-dv-brassLight" : "bg-dv-ember/80 text-dv-bg"].join(" ")}>{savingMarks?.[(member.id ?? "") + ":" + dayNum] ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-dv-brassLight border-t-transparent" /> : (done ? "✓" : isFuture ? "·" : isToday ? "–" : "✕")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {onPingMissing && (
      <button onClick={onPingMissing} disabled={missingToday === 0 || pinging} className="mt-4 w-full pixel-frame bg-dv-ember disabled:bg-dv-panel2 disabled:text-[#fdf3dc] disabled:border-dv-line text-dv-bg text-[10px] py-3 shadow-pixel-sm active:translate-y-[2px] hover:bg-dv-brassLight transition-colors">
        {missingToday === 0 ? "EVERYONE IS CHECKED IN FOR TODAY" : pinging ? "SENDING RAID SIGNAL..." : "PING " + missingToday + " PENDING MEMBER" + (missingToday > 1 ? "S" : "")}
      </button>
      )}
    </PixelPanel></>
  );
}
