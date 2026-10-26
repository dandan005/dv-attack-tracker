"use client";
import { gameAvatar } from "@/lib/gameAvatars";
import { GR } from "@/lib/guildRequest";
import type { RunePick } from "@/lib/useRunePicks";

const FB = "/icons/icon-192.png";
const MAP_LABELS: Record<string, string> = { wasteland: "WASTELAND PLATEAU", lava: "LAVA MOUNTAINS", icevale: "ICE VALE", windcliff: "WIND CLIFF" };

// Player file in the Ledger map: portrait, day rail for this cycle's rune picks, and assignments.
export function PlayerInfoModal({ member, picks, onClose }: { member: any; picks: RunePick[]; onClose: () => void }) {
  const map = member.dv_map && MAP_LABELS[member.dv_map] ? MAP_LABELS[member.dv_map] : "NOT ASSIGNED";
  const gr = GR.find((g) => g.n === member.gr_boss);
  const days = [1, 2, 3].map((d) => ({ d, rune: picks.find((x) => x.day_number === d)?.rune_name ?? null }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="pixel-border relative w-full max-w-sm overflow-hidden bg-dv-panel shadow-pixel" onClick={(e) => e.stopPropagation()}>
        {/* Faint scanlines over the whole card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 4px)" }}
        />

        <div className="relative flex items-center justify-between border-b border-dv-line bg-[#2a1a12] px-4 py-2">
          <p className="eyebrow">Player file</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[11px] text-dv-brassLight">X</button>
        </div>

        <div className="relative space-y-5 p-4">
          {/* Hero: portrait with a guild-request tag, name and rune progress */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 pb-2">
              <img
                src={gameAvatar(member.username) || member.avatar_url || FB}
                onError={(e) => { if (!e.currentTarget.src.endsWith(FB)) e.currentTarget.src = FB; }}
                alt=""
                className="pixel-frame h-24 w-24 border-2 border-dv-brass object-cover shadow-[0_0_14px_rgba(242,196,109,0.25)]"
              />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap border border-dv-brass bg-[#1a0f07] px-2 text-[8px] tracking-[.12em] text-dv-brassLight">
                {gr ? `GR ${gr.r}` : "NO GR"}
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="truncate text-base text-white">{member.username}</p>
              <p className="text-[9px] tracking-[.14em] text-[#fdf3dc]">{map}</p>
              <div className="flex items-center gap-1.5" aria-label={`${picks.length} of 3 runes picked`}>
                {[1, 2, 3].map((i) => (
                  <span key={i} className={"h-2 flex-1 border border-dv-brass " + (i <= picks.length ? "bg-dv-brass" : "")} />
                ))}
                <span className="ml-1 text-[8px] text-dv-brassLight">{picks.length}/3</span>
              </div>
            </div>
          </div>

          {/* Day rail: one node per day, filled when the rune is picked */}
          <div className="space-y-2">
            <p className="eyebrow">Day rail</p>
            <div className="relative grid grid-cols-3 gap-2">
              <div className="absolute left-[16%] right-[16%] top-[7px] h-px bg-dv-brass/50" aria-hidden="true" />
              {days.map(({ d, rune }) => (
                <div key={d} className="relative flex flex-col items-center text-center">
                  <span
                    aria-hidden="true"
                    className={"h-3.5 w-3.5 rotate-45 border " + (rune ? "border-dv-brassLight bg-dv-brassLight shadow-[0_0_8px_rgba(242,196,109,0.6)]" : "border-dv-line bg-dv-panel")}
                  />
                  <span className="mt-2 text-[8px] tracking-[.12em] text-dv-brassLight">DAY {d}</span>
                  <span className={"mt-1 line-clamp-2 min-h-[24px] text-[9px] leading-snug " + (rune ? "text-white" : "text-[#fdf3dc]/50")}>
                    {rune ?? "OPEN"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="item-slot space-y-2 p-3 text-[9px] text-[#fdf3dc]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[8px] tracking-[.14em] text-dv-brassLight">MAP</span>
              <span className="text-right text-white">{map}</span>
            </div>
            <div className="h-px bg-dv-line" aria-hidden="true" />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[8px] tracking-[.14em] text-dv-brassLight">GUILD REQ</span>
              <span className="text-right text-white">{gr ? `${gr.r} ${gr.name}` : "NOT ASSIGNED"}</span>
            </div>
            {gr && <p className="text-right text-[8px] text-[#fdf3dc]/70">{gr.slots} slots · {gr.pts}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
