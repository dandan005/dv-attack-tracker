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
  const urgent = !done && ms > 0 && ms < 60 * 60 * 1000; // < 1 hour left

  async function handleClick() {
    if (done || pending) return;
    setPending(true);
    await onLog(dayNumber);
    setPending(false);
  }

  return (
    <PixelPanel className="mb-4 animate-rise p-0 overflow-hidden">
      <button
        onClick={handleClick}
        disabled={done || pending}
        className={`w-full py-5 px-4 flex items-center justify-center gap-3 text-[11px] sm:text-xs tracking-wide transition-transform active:translate-y-[2px]
          ${
            done
              ? "bg-dv-emeraldDark text-dv-emerald"
              : urgent
              ? "bg-dv-ember text-dv-bg animate-blink"
              : "bg-dv-brass text-dv-bg"
          }
          ${pending ? "opacity-60" : ""}
        `}
      >
        <span className="text-lg">{done ? "✓" : "⚔️"}</span>
        <span>
          {done
            ? `ATTACK LOGGED — RETURNS IN ${formatCountdown(ms)}`
            : pending
            ? "LOGGING..."
            : "LOG TODAY'S ATTACK"}
        </span>
      </button>
    </PixelPanel>
  );
}
