"use client";
import { gameAvatar } from "@/lib/gameAvatars";

type P = { id: string; username: string | null; avatar_url?: string | null };
const FB = "/icons/icon-192.png";
const THEME: Record<string, { top: string; bottom: string; accent: string }> = {
  wasteland: { top: "#d9a35a", bottom: "#5a3a22", accent: "#f0c070" },
  lava: { top: "#c2501f", bottom: "#2a110a", accent: "#ff9a5a" },
  icevale: { top: "#6fa8dc", bottom: "#1c3a6b", accent: "#bfe3ff" },
  windcliff: { top: "#6fae8a", bottom: "#1f3d2c", accent: "#b6f0c8" },
};

function Fire() {
  return (
    <svg viewBox="0 0 16 16" className="h-10 w-10" shapeRendering="crispEdges">
      <rect x="3" y="13" width="10" height="2" fill="#5b3a1e" />
      <rect x="5" y="9" width="6" height="4" fill="#f97316" />
      <rect x="6" y="6" width="4" height="4" fill="#f97316" />
      <rect x="7" y="3" width="2" height="4" fill="#fb923c" />
      <rect x="7" y="9" width="2" height="4" fill="#fde047" />
    </svg>
  );
}

function Seat({ m, accent, onPick }: { m: P | null; accent: string; onPick: (m: any) => void }) {
  if (!m) return <div className="h-12 w-12 border border-dashed opacity-40" style={{ borderColor: accent }} />;
  return (
    <button type="button" onClick={() => onPick(m)} className="flex w-full min-w-0 flex-col items-center gap-1">
      <img src={gameAvatar(m.username) || m.avatar_url || FB} onError={(e) => { if (!e.currentTarget.src.endsWith(FB)) e.currentTarget.src = FB; }} alt="" className="h-10 w-10 border object-cover pixel-frame" style={{ borderColor: accent }} />
      <span className="max-w-full truncate text-[9px] text-white" style={{ textShadow: "0 1px 2px #000" }}>{m.username}</span>
    </button>
  );
}

export default function DvMapScene({ k, label, members, onPick }: { k: string; label: string; members: P[]; onPick: (m: any) => void }) {
  const t = THEME[k] ?? THEME.wasteland;
  const full = members.length >= 5;
  const seat = (i: number) => <Seat m={members[i] ?? null} accent={t.accent} onPick={onPick} />;
  return (
    <div className="pixel-border overflow-hidden" style={{ background: "linear-gradient(" + t.top + "," + t.bottom + ")" }}>
      <div className="mx-2 mt-2 flex items-center gap-2 border px-2 py-2" style={{ background: "#2a1a12", borderColor: "#b8893a" }}>
        <span className="flex-1 text-[10px] text-dv-brassLight">DRAGON VALLEY: {label}</span>
        <span className="text-[9px]" style={{ color: full ? "#6ee7b7" : "#fbbf24" }}>{members.length}/5</span>
      </div>
      <div className="grid grid-cols-3 items-center justify-items-center gap-y-3 px-3 py-4">
        <div />{seat(0)}<div />
        {seat(1)}<Fire />{seat(2)}
        {seat(3)}<div />{seat(4)}
      </div>
    </div>
  );
}
