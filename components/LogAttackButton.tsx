"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getCycleInfo } from "@/lib/cycle";
import { PixelPanel } from "./PixelPanel";

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
  onLog: (day: number) => Promise<void>;
}) {
  const [ms, setMs] = useState<number>(0);
  const [pending, setPending] = useState(false);

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
    await onLog(dayNumber);
    setPending(false);
  }

  return (
    <PixelPanel className="mb-5 animate-rise p-0 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">YOUR RAID LOG</p>
            <h2 className="text-sm text-dv-brassLight mt-2">DAY {dayNumber} ATTACK</h2>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-slate-300/55">RESET IN</p>
            <p className={urgent ? "text-sm text-dv-ember animate-blink" : "text-sm text-dv-emerald"}>{formatCountdown(ms)}</p>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1 mt-4">
          {[1, 2, 3, 4, 5, 6].map((day) => (
            <div key={day} className={["h-1.5 rounded-full", loggedDays.includes(day) ? "bg-dv-emerald" : day === dayNumber ? "bg-dv-brass" : "bg-dv-panel2"].join(" ")} />
          ))}
        </div>
        <p className="text-[8px] text-slate-300/50 mt-2">{loggedDays.length}/6 attacks recorded this cycle</p>
      </div>
      <button
        onClick={handleClick}
        disabled={done || pending}
        className={["w-full py-4 px-4 flex items-center justify-center gap-3 text-[10px] sm:text-xs tracking-wide transition-transform active:translate-y-[2px]", done ? "bg-dv-emeraldDark text-dv-emerald" : urgent ? "bg-dv-ember text-dv-bg animate-blink" : "bg-dv-brass text-dv-bg hover:bg-dv-brassLight", pending ? "opacity-60" : ""].join(" ")}
      >
        <span className="text-lg">{done ? "✓" : "⚔️"}</span>
        <span>{done ? "ATTACK LOGGED — READY FOR RESET" : pending ? "LOGGING..." : "LOG TODAY'S ATTACK"}</span>
      </button>
    </PixelPanel>
  );
}
