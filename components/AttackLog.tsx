"use client";

import { useState } from "react";
import { PixelPanel, PixelHeader } from "./PixelPanel";

export function AttackLog({
  loggedDays,
  currentDay,
  onLog,
}: {
  loggedDays: number[];
  currentDay: number;
  onLog: (day: number) => Promise<void>;
}) {
  const [pending, setPending] = useState<number | null>(null);

  return (
    <PixelPanel className="mb-4 animate-rise">
      <PixelHeader icon="⚔️" title="YOUR ATTACK LOG" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((day) => {
          const done = loggedDays.includes(day);
          const isToday = day === currentDay;
          return (
            <button
              key={day}
              disabled={done || pending !== null}
              onClick={async () => {
                setPending(day);
                await onLog(day);
                setPending(null);
              }}
              className={`pixel-frame py-4 text-[10px] flex flex-col items-center gap-1 shadow-pixel-sm transition-transform active:translate-y-[2px]
                ${done ? "bg-dv-emeraldDark text-dv-emerald border border-dv-emerald" : "bg-dv-panel2 text-dv-brassLight border border-dv-brass"}
                ${isToday && !done ? "ring-2 ring-ember" : ""}
                ${pending === day ? "opacity-50" : ""}
              `}
            >
              <span>{done ? "✓" : isToday ? "!" : "–"}</span>
              <span>D{day}</span>
            </button>
          );
        })}
      </div>
    </PixelPanel>
  );
}
