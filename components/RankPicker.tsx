"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { RANKS, rankByTier, rankImg } from "@/lib/ranks";

export function RankPicker({ tier, onSelect }: { tier: number | null; onSelect: (tier: number) => void }) {
  const [open, setOpen] = useState(false);
  const current = rankByTier(tier);

  const popup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
      <div
        className="[&::-webkit-scrollbar]:hidden w-full max-w-sm rounded-xl border-2 border-dv-line bg-dv-panel2"
        style={{ maxHeight: "78dvh", overflowY: "auto", overscrollBehavior: "contain", scrollbarWidth: "none", touchAction: "pan-y", boxShadow: "0 0 0 2px #000, 0 0 24px rgba(212,175,90,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-dv-line bg-dv-panel2 px-3 py-2">
          <p className="text-[10px] tracking-widest text-dv-brassLight">CHOOSE YOUR RANK</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="border border-dv-line px-2 py-0.5 text-[10px] text-[#fdf3dc]">X</button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {RANKS.map((r) => (
            <button
              key={r.tier}
              type="button"
              onClick={() => { onSelect(r.tier); setOpen(false); }}
              className={["relative flex flex-col items-center gap-1 rounded-md border px-1 pb-2 pt-3 text-[8px]", r.tier === tier ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-[#1f140b] text-[#fdf3dc]"].join(" ")}
              style={r.tier === tier ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}
            >
              <span className="absolute left-1 top-0.5 text-[7px] text-[#fdf3dc]">{r.tier}</span>
              <img src={rankImg(r.file)} alt="" className="h-11 w-11 object-contain" style={{ imageRendering: "pixelated" }} />
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
