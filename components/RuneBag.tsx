"use client";
import { useState, type CSSProperties } from "react";
import { RUNE_ICONS, runeTiers, tierColors, tierStyles } from "@/lib/runes";
import { useRunePicks } from "@/lib/useRunePicks";

// Bag button fixed to the bottom-right, sitting above the tab bar (same corner as the game's bag).
// mapMemberIds: members on the viewer's map. Tags only show picks from them (null = whole guild).
export function RuneBag({ inMap = false, mapMemberIds = null }: { inMap?: boolean; mapMemberIds?: string[] | null }) {
  const [open, setOpen] = useState(false);
  const { picks, meId, reload } = useRunePicks();
  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); reload(); }}
        aria-label="Open rune bag"
        className={"pixel-frame z-30 flex flex-col items-center gap-0.5 bg-transparent px-1.5 py-0 " + (inMap ? "absolute bottom-2 right-3" : "fixed bottom-20 right-4")}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" shapeRendering="crispEdges" aria-hidden="true">
          <rect x="4" y="1" width="8" height="3" fill="#6b8f3a" />
          <rect x="3" y="4" width="10" height="11" fill="#8a5a2b" />
          <rect x="5" y="7" width="6" height="4" fill="#c9a05a" />
          <rect x="3" y="14" width="10" height="1" fill="#4a2c18" />
        </svg>
        <span className="text-[7px] leading-none uppercase tracking-[.1em] text-dv-brassLight">BAG</span>
      </button>
      {open && <RuneBagModal picks={picks} meId={meId} mapMemberIds={mapMemberIds} onClose={() => setOpen(false)} />}
    </>
  );
}

function RuneBagModal({ picks, meId, mapMemberIds, onClose }: { picks: { member_id: string; username: string; day_number: number; rune_name: string }[]; meId: string | null; mapMemberIds: string[] | null; onClose: () => void }) {
  // For each rune, who took it this cycle (same map only when a map is set).
  const scope = mapMemberIds ? new Set(mapMemberIds) : null;
  const takers = new Map<string, string[]>();
  picks.forEach((p) => {
    if (scope && !scope.has(p.member_id)) return;
    const who = p.member_id === meId ? "YOU" : p.username;
    takers.set(p.rune_name, [...(takers.get(p.rune_name) ?? []), `D${p.day_number} ${who}`]);
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="pixel-border max-h-[88vh] w-full max-w-sm space-y-3 overflow-y-auto no-scrollbar bg-dv-panel p-4 shadow-pixel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="eyebrow">BAG // ALL RUNES</p>
          <button type="button" onClick={onClose} aria-label="Close" className="item-slot px-2 py-1 text-[10px]">X</button>
        </div>
        <p className="text-[9px] uppercase tracking-[.1em] text-[#fdf3dc]">Status shows who on {scope ? "your map" : "your guild"} took each rune this cycle, by day.</p>
        {runeTiers.map((t) => (
          <div key={t.name}>
            <p className={"eyebrow mb-1 " + tierStyles[t.accent].text}>{t.name.toUpperCase()}</p>
            <div className="space-y-1">
              {t.groups.flatMap((g) => g.runes).map((r) => {
                const tk = takers.get(r.name);
                return (
                  <div key={r.name} className="item-slot p-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5" style={{ ["--rc" as string]: tierColors[t.accent] } as CSSProperties}>
                        {RUNE_ICONS[r.name] && <span className="rune-icon shrink-0" aria-hidden="true" style={{ maskImage: `url(/runes/${RUNE_ICONS[r.name]}.png)`, WebkitMaskImage: `url(/runes/${RUNE_ICONS[r.name]}.png)`, width: 18, height: 18 } as CSSProperties} />}
                        <span className={"text-[10px] " + tierStyles[t.accent].text}>{r.name}</span>
                      </span>
                      {tk ? (
                        <span className="shrink-0 text-[8px] text-dv-emerald">{tk.join(" · ")}</span>
                      ) : (
                        <span className="shrink-0 text-[8px] text-[#fdf3dc]">FREE</span>
                      )}
                    </div>
                    <p className="mt-1 text-[9px] leading-relaxed text-[#fdf3dc]">{r.effect}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
