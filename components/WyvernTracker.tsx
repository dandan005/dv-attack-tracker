"use client";

import { useState } from "react";
import { PixelPanel, PixelHeader } from "./PixelPanel";

type Element = "wind" | "fire" | "earth" | "water";

const ELEMENTS: { key: Element; label: string; icon: string; hint: string }[] = [
  { key: "wind", label: "WIND", icon: "🌪️", hint: "swift" },
  { key: "fire", label: "FIRE", icon: "🔥", hint: "fierce" },
  { key: "earth", label: "EARTH", icon: "⛰️", hint: "steady" },
  { key: "water", label: "WATER", icon: "💧", hint: "deep" },
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
    <PixelPanel className="mb-5 animate-rise">
      <PixelHeader icon="🐲" title="WYVERN TRACE" right={<span className="text-[8px] text-dv-bg/70 tracking-wider">RAID SIGNAL</span>} />
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] text-dv-brassLight">What element is the guild hunting?</p>
          <p className="text-[8px] text-slate-300/55 mt-1">Broadcast the current trace so everyone is synced.</p>
        </div>
        {current && <span className="status-chip shrink-0">SYNCED</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {ELEMENTS.map((el) => {
          const active = current === el.key;
          return (
            <button
              key={el.key}
              type="button"
              aria-pressed={active}
              disabled={pending !== null}
              onClick={async () => {
                setPending(el.key);
                await onSelect(el.key);
                setPending(null);
              }}
              className={["element-choice", "element-choice--" + el.key, active ? "is-active" : "", pending === el.key ? "is-pending" : ""].join(" ")}
            >
              <span className="element-orb"><span className="text-base">{el.icon}</span></span>
              <span className="element-label">{el.label}</span>
              <span className="element-state">{active ? "TRACE SET" : el.hint.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {current && <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 text-[9px] text-dv-brassLight flex items-start gap-2"><span className="text-dv-violet">◆</span><span>{current.toUpperCase()} trace locked for this raid{setBy ? " · set by " + setBy : ""}.</span></div>}
    </PixelPanel>
  );
}
