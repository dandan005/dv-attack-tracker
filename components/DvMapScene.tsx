"use client";
import type { CSSProperties } from "react";
import { gameAvatar } from "@/lib/gameAvatars";

type P = { id: string; username: string | null; avatar_url?: string | null };
const FB = "/icons/icon-192.png";
const THEME: Record<string, { top: string; bottom: string; accent: string; chef: string }> = {
  wasteland: { top: "#f0b860", bottom: "#4a2c18", accent: "#f0c070", chef: "Arwen" },
  lava: { top: "#b8431a", bottom: "#1c0b07", accent: "#ff9a5a", chef: "Gene" },
  icevale: { top: "#6fa8e0", bottom: "#1e3a66", accent: "#bfe3ff", chef: "Rosa" },
  windcliff: { top: "#7fb89c", bottom: "#14301e", accent: "#b6f0c8", chef: "Cedric" },
};
const POS = [{ x: 49, y: 50 }, { x: 24, y: 57 }, { x: 75, y: 57 }, { x: 29, y: 71 }, { x: 70, y: 71 }];
const SHADOW: CSSProperties = { textShadow: "0 1px 0 rgba(0,0,0,.7)" };

function Scenery({ k }: { k: string }) {
  const c = "pointer-events-none absolute inset-0 h-full w-full";
  const p = { viewBox: "0 0 160 272", preserveAspectRatio: "xMidYMid slice", className: c, shapeRendering: "crispEdges" as const };
  if (k === "lava") return (
    <svg {...p}>
      <rect x="0" y="30" width="160" height="90" fill="#ff7a1a" opacity=".16" />
      <polygon points="14,150 80,44 146,150" fill="#2e130c" />
      <polygon points="58,92 80,44 102,92" fill="#4a1d10" />
      <polyline points="80,46 74,76 84,96 76,124" fill="none" stroke="#ff8a1f" strokeWidth="2.4" />
      <polyline points="88,70 98,100 92,128" fill="none" stroke="#ffb347" strokeWidth="1.8" />
      <rect x="22" y="104" width="34" height="14" fill="#b83a10" /><rect x="28" y="98" width="22" height="7" fill="#c2410c" /><rect x="34" y="118" width="10" height="14" fill="#e7d3b0" />
      <rect x="112" y="112" width="22" height="9" fill="#c2410c" /><rect x="118" y="121" width="8" height="10" fill="#e7d3b0" />
      <rect x="4" y="60" width="4" height="86" fill="#120705" /><rect x="8" y="78" width="12" height="3" fill="#120705" />
      <rect x="150" y="56" width="4" height="90" fill="#120705" /><rect x="138" y="82" width="12" height="3" fill="#120705" />
      <ellipse cx="80" cy="168" rx="76" ry="52" fill="#4a2a1a" /><ellipse cx="80" cy="172" rx="60" ry="38" fill="#5a3522" />
      <polygon points="0,228 30,214 70,226 110,210 160,222 160,272 0,272" fill="#150906" />
    </svg>
  );
  if (k === "icevale") return (
    <svg {...p}>
      <polygon points="0,150 40,56 90,150" fill="#cfe6fb" />
      <polygon points="60,150 112,48 160,150" fill="#e6f3ff" />
      <polygon points="40,56 30,80 50,80" fill="#ffffff" /><polygon points="112,48 100,76 124,76" fill="#ffffff" />
      <ellipse cx="38" cy="132" rx="22" ry="9" fill="#4f86c6" />
      <polygon points="2,150 16,96 30,150" fill="#27573d" /><polygon points="5,122 16,88 27,122" fill="#2f6b4a" />
      <polygon points="130,150 144,92 158,150" fill="#27573d" /><polygon points="133,120 144,84 155,120" fill="#2f6b4a" />
      <rect x="14" y="94" width="5" height="4" fill="#ffffff" /><rect x="142" y="90" width="5" height="4" fill="#ffffff" />
      <ellipse cx="80" cy="168" rx="76" ry="52" fill="#a9d0ee" /><ellipse cx="80" cy="172" rx="60" ry="38" fill="#c4e2f7" />
      <polygon points="0,226 40,214 90,224 130,212 160,222 160,272 0,272" fill="#e9f5ff" />
      <rect x="0" y="248" width="160" height="24" fill="#1e3a66" />
    </svg>
  );
  if (k === "windcliff") return (
    <svg {...p}>
      <polygon points="0,150 52,52 112,150" fill="#7fb59a" />
      <polygon points="64,150 120,40 160,150" fill="#6aa68a" />
      <rect x="6" y="96" width="22" height="40" fill="#8a9fa6" /><rect x="132" y="86" width="16" height="50" fill="#8a9fa6" />
      <circle cx="14" cy="64" r="6" fill="#c0392b" /><circle cx="23" cy="68" r="6" fill="#c0392b" /><circle cx="18" cy="57" r="6" fill="#d4483a" />
      <rect x="128" y="56" width="14" height="22" fill="#e6b422" /><rect x="131" y="48" width="8" height="9" fill="#3f7d3a" />
      <polygon points="58,146 68,112 78,146" fill="#1f4a2e" /><polygon points="96,146 106,106 116,146" fill="#1f4a2e" />
      <ellipse cx="80" cy="168" rx="76" ry="52" fill="#7a6040" /><ellipse cx="80" cy="172" rx="60" ry="38" fill="#8a6a45" />
      <polygon points="0,226 30,214 76,224 118,210 160,220 160,272 0,272" fill="#14301e" />
    </svg>
  );
  return (
    <svg {...p}>
      <rect x="0" y="40" width="160" height="30" fill="#ffffff" opacity=".1" />
      <rect x="6" y="56" width="84" height="64" fill="#9a6a3a" /><rect x="6" y="50" width="84" height="9" fill="#c28f58" />
      <rect x="96" y="76" width="58" height="46" fill="#7a4c28" /><rect x="96" y="70" width="58" height="9" fill="#a8743f" />
      <ellipse cx="80" cy="168" rx="76" ry="52" fill="#8a5a30" /><ellipse cx="80" cy="172" rx="60" ry="38" fill="#9a6a3a" />
      <rect x="4" y="110" width="9" height="32" fill="#5e8a2e" /><rect x="0" y="118" width="6" height="10" fill="#5e8a2e" /><rect x="6" y="114" width="3" height="3" fill="#c0392b" />
      <rect x="146" y="104" width="9" height="36" fill="#5e8a2e" /><rect x="154" y="112" width="6" height="12" fill="#5e8a2e" /><rect x="147" y="108" width="3" height="3" fill="#c0392b" />
      <polygon points="0,226 36,212 84,222 124,208 160,218 160,272 0,272" fill="#2b1810" />
    </svg>
  );
}

function Fire({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 20" className="h-12 w-14" shapeRendering="crispEdges">
      <rect x="3" y="15" width="18" height="3" fill="#5b3a1e" />
      <rect x="6" y="12" width="12" height="4" fill="#7a4c28" />
      {lit && (<><rect x="8" y="8" width="8" height="5" fill="#f97316" /><rect x="9" y="4" width="6" height="5" fill="#f97316" /><rect x="11" y="1" width="2" height="5" fill="#fb923c" /><rect x="10" y="9" width="4" height="4" fill="#fde047" /></>)}
    </svg>
  );
}

function Flag() {
  return (
    <svg viewBox="0 0 24 40" className="h-full w-full" shapeRendering="crispEdges">
      <rect x="10" y="0" width="4" height="3" fill="#c9a05a" />
      <rect x="11" y="2" width="2" height="38" fill="#8a6a3a" />
      <polygon points="3,6 21,6 21,26 12,32 3,26" fill="#7a4a2a" stroke="#c9a05a" strokeWidth="1" />
      <rect x="9" y="17" width="6" height="5" fill="#f3e6d0" />
      <rect x="6" y="13" width="3" height="3" fill="#f3e6d0" /><rect x="10" y="10" width="3" height="3" fill="#f3e6d0" />
      <rect x="14" y="13" width="3" height="3" fill="#f3e6d0" />
    </svg>
  );
}

function Stall() {
  return (
    <svg viewBox="0 0 50 40" className="block w-full" shapeRendering="crispEdges">
      <polygon points="4,14 25,4 46,14" fill="#e8a33a" stroke="#9a6a1a" strokeWidth="1" />
      <rect x="6" y="14" width="38" height="16" fill="#7a4c28" />
      <rect x="10" y="20" width="12" height="6" fill="#2a1a12" />
      <rect x="31" y="6" width="9" height="5" fill="#ffffff" />
      <rect x="32" y="11" width="7" height="6" fill="#f0c8a0" />
      <rect x="31" y="17" width="9" height="13" fill="#3f6a8a" />
    </svg>
  );
}

function Tag({ text, style }: { text: string; style: CSSProperties }) {
  return <span className="pointer-events-none absolute border px-2 py-1 text-[8px] text-white" style={{ background: "rgba(30,30,30,.92)", borderColor: "#0b0b0b", ...style }}>{text}</span>;
}

function Seat({ m, accent, pos, onPick }: { m: P | null; accent: string; pos: { x: number; y: number }; onPick: (m: any) => void }) {
  const wrap: CSSProperties = { left: pos.x + "%", top: pos.y + "%", transform: "translate(-50%, -50%)" };
  const log = <div className="-mt-2 h-3 w-16 rounded-full" style={{ background: "#3a2414", border: "1px solid #1c120a" }} />;
  if (!m) return (
    <div className="absolute flex flex-col items-center" style={wrap}>
      <div className="relative z-10 h-12 w-12 border border-dashed opacity-50" style={{ borderColor: accent }} />
      {log}
    </div>
  );
  return (
    <button type="button" onClick={() => onPick(m)} className="absolute flex flex-col items-center" style={wrap}>
      <img src={gameAvatar(m.username) || m.avatar_url || FB} onError={(e) => { if (!e.currentTarget.src.endsWith(FB)) e.currentTarget.src = FB; }} alt="" className="relative z-10 h-12 w-12 border object-cover pixel-frame" style={{ borderColor: accent }} />
      {log}
      <span className="mt-0.5 max-w-[88px] truncate px-1 text-[9px] text-white" style={{ background: "rgba(0,0,0,.55)" }}>{m.username}</span>
    </button>
  );
}

export default function DvMapScene({ k, label, members, onPick }: { k: string; label: string; members: P[]; onPick: (m: any) => void }) {
  const t = THEME[k] ?? THEME.wasteland;
  const full = members.length >= 5;
  const mid: CSSProperties = { transform: "translate(-50%, -50%)" };
  return (
    <div className="pixel-border relative overflow-hidden" style={{ background: "linear-gradient(" + t.top + "," + t.bottom + ")", minHeight: "calc(100dvh - 16rem)", aspectRatio: "10 / 17" }}>
      <Scenery k={k} />
      <div className="absolute inset-x-2 top-2 flex items-center gap-2 border px-2 py-2" style={{ background: "#2a1a12", borderColor: "#b8893a" }}>
        <span className="w-6" />
        <span className="flex-1 text-center text-[10px] text-dv-brassLight">DRAGON VALLEY: {label}</span>
        <span className="w-6 text-right text-[9px]" style={{ color: full ? "#6ee7b7" : "#fbbf24" }}>{members.length}/5</span>
      </div>
      <p className="pointer-events-none absolute inset-x-4 text-center text-[8px] leading-relaxed text-white/90" style={{ top: "13%", ...SHADOW }}>A VALLEY WHERE DRAGONS HAVE LIVED SINCE LONG AGO.</p>
      <div className="pointer-events-none absolute" style={{ left: "17%", top: "34%", width: "12%" }}><div style={{ aspectRatio: "24 / 40" }}><Flag /></div></div>
      <div className="pointer-events-none absolute" style={{ left: "56%", top: "35%", width: "26%" }}>
        <span className="block pr-2 text-right text-[9px] text-white" style={SHADOW}>{t.chef}</span>
        <Stall />
      </div>
      <Tag text="EXPLORATION" style={{ left: "32%", top: "40%" }} />
      <Tag text="CHEF" style={{ left: "70%", top: "45%" }} />
      <div className="pointer-events-none absolute" style={{ left: "50%", top: "64%", ...mid }}><Fire lit={k !== "icevale"} /></div>
      <Tag text="COOKING" style={{ left: "50%", top: "72%", ...mid }} />
      {POS.map((pos, i) => (<Seat key={i} m={members[i] ?? null} accent={t.accent} pos={pos} onPick={onPick} />))}
    </div>
  );
}
