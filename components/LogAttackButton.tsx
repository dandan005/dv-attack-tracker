"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getCycleInfo } from "@/lib/cycle";
import { PixelPanel } from "./PixelPanel";

function AttackGlyph({ done, urgent }: { done: boolean; urgent: boolean }) {
  if (done) {
    return <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><rect x="3" y="2" width="10" height="2" fill="currentColor" /><rect x="2" y="4" width="12" height="8" fill="currentColor" /><rect x="4" y="12" width="8" height="2" fill="currentColor" /><rect x="5" y="7" width="2" height="2" fill="#11172b" /><rect x="8" y="9" width="4" height="2" fill="#11172b" /><rect x="9" y="6" width="2" height="2" fill="#ffe3a1" /></svg>;
  }

  if (urgent) {
    return <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><rect x="7" y="2" width="2" height="7" fill="currentColor" /><rect x="7" y="11" width="2" height="2" fill="currentColor" /><rect x="4" y="4" width="2" height="2" fill="currentColor" /><rect x="10" y="4" width="2" height="2" fill="currentColor" /><rect x="4" y="10" width="2" height="2" fill="currentColor" /><rect x="10" y="10" width="2" height="2" fill="currentColor" /></svg>;
  }

  return <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><rect x="7" y="1" width="2" height="14" fill="currentColor" /><rect x="4" y="4" width="8" height="2" fill="currentColor" /><rect x="5" y="11" width="6" height="2" fill="currentColor" /><rect x="6" y="13" width="4" height="2" fill="currentColor" /><rect x="9" y="2" width="2" height="2" fill="#fff2bd" /></svg>;
}

export function LogAttackButton({
  anchorDate,
  resetHour,
  dayNumber,
  loggedDays,
  onLog,
}: {
  anchorDate: string;
  resetHour: number;
  dayNumber: number;
  loggedDays: number[];
  onLog: (day: number, promotionTier: number | null, damageScore: number | null) => Promise<void>;
}) {
  const [ms, setMs] = useState<number>(0);
  const [pending, setPending] = useState(false);
  const [promotionTier, setPromotionTier] = useState("");
  const [damageScore, setDamageScore] = useState("");

  useEffect(() => {
    const tick = () => setMs(getCycleInfo(anchorDate, resetHour).msUntilReset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [anchorDate, resetHour]);

  const done = loggedDays.includes(dayNumber);
  const urgent = !done && ms > 0 && ms < 60 * 60 * 1000;

  async function handleClick() {
    if (done || pending) return;
    setPending(true);
    try {
      await onLog(dayNumber, promotionTier === "" ? null : Number(promotionTier), damageScore === "" ? null : Number(damageScore));
    } finally {
      setPending(false);
    }
  }

  return (
    <PixelPanel className="mb-5 animate-rise p-0 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-end justify-between gap-3">
          <div><p className="eyebrow">YOUR RAID LOG</p><h2 className="text-sm text-dv-brassLight mt-2">DAY {dayNumber} ATTACK</h2></div>
          <div className="text-right"><p className="text-[7px] text-slate-300/55">RESET IN</p><p className={urgent ? "text-sm text-dv-ember animate-blink" : "text-sm text-dv-emerald"}>{formatCountdown(ms)}</p></div>
        </div>
        <div className="grid grid-cols-6 gap-1 mt-4">{[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={["h-1.5 rounded-full", loggedDays.includes(day) ? "bg-dv-emerald" : day === dayNumber ? "bg-dv-brass" : "bg-dv-panel2"].join(" ")} />)}</div>
        <p className="text-[8px] text-slate-300/50 mt-2">{loggedDays.length}/6 attacks recorded this cycle</p>
      </div>

      {!done && <div className="px-4 pb-4 grid grid-cols-2 gap-2"><label className="item-slot p-2 text-[7px] text-slate-300/55">PROMOTION TIER<input type="number" min={0} step={1} inputMode="numeric" value={promotionTier} onChange={(event) => setPromotionTier(event.target.value)} placeholder="optional" className="mt-2 w-full bg-transparent text-[10px] text-dv-brassLight outline-none placeholder:text-slate-300/25" /></label><label className="item-slot p-2 text-[7px] text-slate-300/55">DAMAGE / POINTS<input type="number" min={0} step={1} inputMode="numeric" value={damageScore} onChange={(event) => setDamageScore(event.target.value)} placeholder="optional" className="mt-2 w-full bg-transparent text-[10px] text-dv-brassLight outline-none placeholder:text-slate-300/25" /></label><p className="col-span-2 text-[7px] text-slate-300/40">Higher-promotion damage is worth more raid points. Add the result when you have it.</p></div>}

      <button onClick={handleClick} disabled={done || pending} aria-label={done ? "Attack logged" : "Log today's attack"} className={["attack-action", done ? "is-done" : urgent ? "is-urgent" : "", pending ? "is-pending" : ""].join(" ")}>
        <span className="attack-sigil"><AttackGlyph done={done} urgent={urgent} /></span>
        <span className="attack-copy">{done ? "ATTACK SEALED" : pending ? "LOGGING..." : "LOG TODAY'S ATTACK"}<small>{done ? "RAID ENTRY CONFIRMED" : urgent ? "RESET WINDOW CLOSING" : "ADD YOUR RUN TO THE GUILD LEDGER"}</small></span>
      </button>
    </PixelPanel>
  );
}
