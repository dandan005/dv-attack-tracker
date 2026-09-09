"use client";

import { useState } from "react";
import { PixelPanel, PixelHeader } from "./PixelPanel";

type Element = "wind" | "fire" | "earth" | "water";

const ELEMENTS: { key: Element; label: string; icon: string }[] = [
  { key: "wind", label: "WIND", icon: "🌪️" },
  { key: "fire", label: "FIRE", icon: "🔥" },
  { key: "earth", label: "EARTH", icon: "⛰️" },
  { key: "water", label: "WATER", icon: "💧" },
];

export function WyvernTracker({
  current,
  setBy,
  onSelect,
}: {
  current: Element | null;
  setBy: string | null;
  onSelect: (el: Element) => Promise<void>;
}) {
  const [pending, setPending] = useState<Element | null>(null);

  return (
    <PixelPanel className="mb-4 animate-rise">
      <PixelHeader icon="🐲" title="TRACK WYVERN" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {ELEMENTS.map((el) => {
          const active = current === el.key;
          return (
            <button
              key={el.key}
              disabled={pending !== null}
              onClick={async () => {
                setPending(el.key);
                await onSelect(el.key);
                setPending(null);
              }}
              className={`pixel-frame py-4 flex flex-col items-center gap-1 text-[9px] shadow-pixel-sm active:translate-y-[2px]
                ${active ? "bg-dv-ember text-dv-bg border border-dv-ember" : "bg-dv-panel2 text-dv-brassLight border border-dv-brass"}
                ${pending === el.key ? "opacity-50" : ""}
              `}
            >
              <span className="text-lg">{el.icon}</span>
              <span>{el.label}</span>
            </button>
          );
        })}
      </div>
      {current && (
        <div className="pixel-frame border border-dv-ember bg-dv-panel2 px-3 py-3 text-[9px] text-dv-ember flex items-start gap-2">
          <span>🔔</span>
          <span>
            RAID SIGNAL: {current.toUpperCase()} trace set — scouting in progress
            {setBy ? ` (by ${setBy})` : ""}
          </span>
        </div>
      )}
    </PixelPanel>
  );
}
