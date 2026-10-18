"use client";
import { gameAvatar } from "@/lib/gameAvatars";

type P = { id: string; username: string | null; avatar_url?: string | null };
const FB = "/icons/icon-192.png";
const THEME: Record<string, { top: string; bottom: string; accent: string }> = {
  wasteland: { top: "#e8b46a", bottom: "#6e4425", accent: "#f0c070" },
  lava: { top: "#7a2a12", bottom: "#1c0b07", accent: "#ff9a5a" },
  icevale: { top: "#8cc0ee", bottom: "#2a4f8a", accent: "#bfe3ff" },
  windcliff: { top: "#8fc4a6", bottom: "#2f5d3c", accent: "#b6f0c8" },
};

function Scenery({ k }: { k: string }) {
  const c = "pointer-events-none absolute inset-0 h-full w-full";
  if (k === "lava") return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" className={c} shapeRendering="crispEdges">
      <rect x="0" y="0" width="160" height="60" fill="#ff7a1a" opacity="0.18" />
      <polygon points="30,100 80,18 130,100" fill="#2e130c" />
      <polygon points="62,60 80,18 98,60" fill="#4a1d10" />
      <polyline points="80,20 76,46 84,62 78,84" fill="none" stroke="#ff8a1f" strokeWidth="2" />
      <polyline points="86,40 96,66 90,90" fill="none" stroke="#ffb347" strokeWidth="1.5" />
      <rect x="0" y="92" width="160" height="28" fill="#1c0b07" />
      <rect x="12" y="84" width="14" height="5" fill="#c2410c" />
      <rect x="16" y="89" width="5" height="6" fill="#e7d3b0" />
      <rect x="132" y="86" width="12" height="5" fill="#c2410c" />
      <rect x="136" y="91" width="4" height="5" fill="#e7d3b0" />
      <rect x="6" y="40" width="3" height="52" fill="#120705" />
      <rect x="150" y="48" width="3" height="44" fill="#120705" />
    </svg>
  );
  if (k === "icevale") return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" className={c} shapeRendering="crispEdges">
      <polygon points="0,96 38,36 76,96" fill="#cfe6fb" />
      <polygon points="56,96 108,26 160,96" fill="#e6f3ff" />
      <polygon points="38,36 29,54 47,54" fill="#ffffff" />
      <polygon points="108,26 97,48 119,48" fill="#ffffff" />
      <rect x="0" y="90" width="160" height="30" fill="#eaf6ff" />
      <polygon points="8,94 20,68 32,94" fill="#27573d" />
      <polygon points="10,80 20,60 30,80" fill="#2f6b4a" />
      <polygon points="128,94 140,68 152,94" fill="#27573d" />
      <polygon points="130,80 140,60 150,80" fill="#2f6b4a" />
      <rect x="18" y="64" width="4" height="3" fill="#ffffff" />
      <rect x="138" y="64" width="4" height="3" fill="#ffffff" />
    </svg>
  );
  if (k === "windcliff") return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" className={c} shapeRendering="crispEdges">
      <polygon points="0,92 50,40 100,92" fill="#7fb59a" />
      <polygon points="60,92 118,28 160,92" fill="#6aa68a" />
      <polygon points="14,70 26,50 38,70" fill="#8a9fa6" />
      <rect x="0" y="92" width="160" height="28" fill="#2f5d3c" />
      <circle cx="14" cy="84" r="4" fill="#c0392b" />
      <circle cx="21" cy="86" r="4" fill="#c0392b" />
      <circle cx="17" cy="79" r="4" fill="#d4483a" />
      <rect x="140" y="76" width="9" height="14" fill="#e6b422" />
      <rect x="142" y="71" width="5" height="6" fill="#3f7d3a" />
      <polygon points="124,94 132,76 140,94" fill="#1f4a2e" />
    </svg>
  );
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" className={c} shapeRendering="crispEdges">
      <rect x="0" y="0" width="160" height="50" fill="#ffffff" opacity="0.08" />
      <rect x="18" y="38" width="80" height="34" fill="#8a5a30" />
      <rect x="18" y="32" width="80" height="8" fill="#b98450" />
      <rect x="100" y="52" width="46" height="22" fill="#7a4c28" />
      <rect x="100" y="47" width="46" height="7" fill="#a8743f" />
      <rect x="0" y="82" width="160" height="38" fill="#6e4425" />
      <rect x="10" y="66" width="6" height="22" fill="#4d7c2a" />
      <rect x="5" y="72" width="5" height="8" fill="#4d7c2a" />
      <rect x="8" y="68" width="3" height="3" fill="#c0392b" />
      <rect x="140" y="64" width="6" height="24" fill="#4d7c2a" />
      <rect x="146" y="70" width="5" height="8" fill="#4d7c2a" />
      <rect x="141" y="66" width="3" height="3" fill="#c0392b" />
    </svg>
  );
}

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
      <span className="max-w-full truncate px-1 text-[9px] text-white" style={{ background: "rgba(0,0,0,.5)" }}>{m.username}</span>
    </button>
  );
}

export default function DvMapScene({ k, label, members, onPick }: { k: string; label: string; members: P[]; onPick: (m: any) => void }) {
  const t = THEME[k] ?? THEME.wasteland;
  const full = members.length >= 5;
  const seat = (i: number) => <Seat m={members[i] ?? null} accent={t.accent} onPick={onPick} />;
  return (
    <div className="pixel-border relative overflow-hidden" style={{ background: "linear-gradient(" + t.top + "," + t.bottom + ")" }}>
      <Scenery k={k} />
      <div className="relative mx-2 mt-2 flex items-center gap-2 border px-2 py-2" style={{ background: "#2a1a12", borderColor: "#b8893a" }}>
        <span className="flex-1 text-[10px] text-dv-brassLight">DRAGON VALLEY: {label}</span>
        <span className="text-[9px]" style={{ color: full ? "#6ee7b7" : "#fbbf24" }}>{members.length}/5</span>
      </div>
      <div className="relative grid grid-cols-3 items-center justify-items-center gap-y-3 px-3 py-6">
        <div />{seat(0)}<div />
        {seat(1)}<Fire />{seat(2)}
        {seat(3)}<div />{seat(4)}
      </div>
    </div>
  );
}
