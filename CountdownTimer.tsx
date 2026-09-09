"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getCycleInfo } from "@/lib/cycle";
import { PixelPanel } from "./PixelPanel";

export function CountdownTimer({
  anchorDate,
  resetHour,
  dayNumber,
}: {
  anchorDate: string;
  resetHour: number;
  dayNumber: number;
}) {
  const [ms, setMs] = useState<number>(0);

  useEffect(() => {
    const tick = () => setMs(getCycleInfo(anchorDate, resetHour).msUntilReset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [anchorDate, resetHour]);

  const urgent = ms > 0 && ms < 60 * 60 * 1000; // < 1 hour left

  return (
    <PixelPanel className="mb-4 flex items-center justify-between animate-rise">
      <div>
        <p className="text-[10px] text-dv-brassLight mb-1">D{dayNumber} RESETS IN</p>
        <p
          className={`text-lg sm:text-xl tracking-widest ${
            urgent ? "text-ember animate-blink" : "text-dv-emerald"
          }`}
        >
          {formatCountdown(ms)}
        </p>
      </div>
      <span className="text-2xl">⏳</span>
    </PixelPanel>
  );
}
