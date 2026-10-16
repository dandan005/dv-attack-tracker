"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { RANKS, rankByTier, rankImg } from "@/lib/ranks";

export function RankPicker({ tier, onSelect }: { tier: number | null; onSelect: (tier: number) => void }) {
  const [open, setOpen] = useState(false);
  const current = rankByTier(tier);

  const popup = (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" onClick={() => setOpen(false)}>
      <div className="pixel-frame item-slot w-full max-w-md max-h-[80vh] overflow-y-auto p-3" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">CHOOSE YOUR RANK</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="px-2 text-xs text-slate-300/70">X</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RANKS.map((r) => (
            <button
              key={r.tier}
              type="button"
              onClick={() => { onSelect(r.tier); setOpen(false); }}
              className={["flex flex-col items-center gap-1 border p-2 text-[9px]", r.tier === tier ? "border-dv-brass bg-dv-panel2 text-dv-brassLight" : "border-dv-line text-slate-200/80"].join(" ")}
            >
              <img src={rankImg(r.file)} alt="" className="h-10 w-10 object-contain" style={{ imageRendering: "pixelated" }} />
              <span className="text-center leading-tight">{r.name.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Choose promotion rank" className="flex h-6 shrink-0 items-center gap-1 border border-dv-line bg-dv-panel2 px-1.5 text-[9px] text-dv-brassLight">
        {current && <img src={rankImg(current.file)} alt="" className="h-4 w-4 object-contain" style={{ imageRendering: "pixelated" }} />}
        {current ? current.name.toUpperCase() : "SET RANK"}
      </button>
      {open && typeof document !== "undefined" && createPortal(popup, document.body)}
    </>
  );
}
