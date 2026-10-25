"use client";
import { gameAvatar } from "@/lib/gameAvatars";
import { GR } from "@/lib/guildRequest";
import type { RunePick } from "@/lib/useRunePicks";

const FB = "/icons/icon-192.png";
const MAP_LABELS: Record<string, string> = { wasteland: "WASTELAND PLATEAU", lava: "LAVA MOUNTAINS", icevale: "ICE VALE", windcliff: "WIND CLIFF" };

// Player card in the Ledger map: avatar, assignments and this cycle's day rune picks.
export function PlayerInfoModal({ member, picks, onClose }: { member: any; picks: RunePick[]; onClose: () => void }) {
  const map = member.dv_map && MAP_LABELS[member.dv_map] ? MAP_LABELS[member.dv_map] : "NOT ASSIGNED";
  const gr = GR.find((g) => g.n === member.gr_boss);
  const tiles = [
    { glyph: "⛰", label: "MAP", value: map.split(" ")[0] },
    { glyph: "⚔", label: "GUILD REQ", value: gr ? gr.r : "—" },
    { glyph: "ᛟ", label: "RUNES", value: `${picks.length}/3` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="pixel-border w-full max-w-xs overflow-hidden bg-dv-panel shadow-pixel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-dv-line bg-[#2a1a12] px-3 py-2">
          <span className="w-6" />
          <p className="text-[10px] uppercase tracking-[.1em] text-dv-brassLight">User Info</p>
          <button type="button" onClick={onClose} aria-label="Close" className="w-6 text-right text-[11px] text-dv-brassLight">X</button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-center text-sm text-white">{member.username}</p>
          <div className="flex justify-center">
            <img
              src={gameAvatar(member.username) || member.avatar_url || FB}
              onError={(e) => { if (!e.currentTarget.src.endsWith(FB)) e.currentTarget.src = FB; }}
              alt=""
              className="pixel-frame h-24 w-24 border border-dv-brass object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className="item-slot flex flex-col items-center p-2 text-center">
                <span className="text-lg leading-none text-dv-brassLight">{t.glyph}</span>
                <span className="mt-1 text-[8px] text-[#fdf3dc]">{t.label}</span>
                <span className="text-[9px] text-white">{t.value}</span>
              </div>
            ))}
          </div>
          <div className="item-slot space-y-1.5 p-3 text-[9px] text-[#fdf3dc]">
            <p><span className="text-[#fdf3dc]">MAP</span> · {map}</p>
            <p><span className="text-[#fdf3dc]">GUILD REQUEST</span> · {gr ? `${gr.r} ${gr.name} (${gr.slots} slots, ${gr.pts})` : "NOT ASSIGNED"}</p>
            {[1, 2, 3].map((d) => {
              const p = picks.find((x) => x.day_number === d);
              return <p key={d}><span className="text-[#fdf3dc]">DAY {d}</span> · {p ? p.rune_name : "—"}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
