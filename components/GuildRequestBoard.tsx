"use client";
import { useState } from "react";
import { gameAvatar } from "@/lib/gameAvatars";

type P = { id: string; username: string | null; avatar_url?: string | null; gr_boss: number | null };
type B = { n: number; r: string; name: string; slots: number; pts: string };
const FB = "/icons/icon-192.png";

const INFO: Record<number, { el: "fire" | "earth" | "water"; bless: string; curse: string; bg: [string, string] }> = {
  1: { el: "fire", bless: "MSPD INCREASED", curse: "SKILLS WITH COOLDOWN CONDITION CAN NOT BE USED", bg: ["#1c2a4a", "#3a3326"] },
  2: { el: "earth", bless: "DMG OF EPIC GRADE ACTIVE ATTACK SKILLS INCREASED BY 1000%", curse: "WIND ATTRIBUTE SKILLS CAN NOT BE USED", bg: ["#5a4636", "#2a1c1c"] },
  3: { el: "water", bless: "MSPD INCREASED", curse: "FULGUROUS CAN NOT BE USED", bg: ["#0f1a3a", "#3a3a6a"] },
  4: { el: "earth", bless: "DMG OF COMMON GRADE ACTIVE ATTACK SKILLS INCREASED BY 2000%", curse: "MYTHIC GRADE SKILLS CAN NOT BE USED", bg: ["#5a7aa0", "#5a2a1a"] },
  5: { el: "fire", bless: "[IRON WILL] EFFECT X10", curse: "COOLDOWN RECHARGE SPEED REDUCED", bg: ["#7a3a3a", "#3a1a1a"] },
  6: { el: "earth", bless: "DMG OF COMMON GRADE ACTIVE ATTACK SKILLS INCREASED BY 2000%", curse: "MANA RECOVERY REDUCED", bg: ["#e8a050", "#7a3a20"] },
};

function Beast({ n }: { n: number }) {
  const p = { viewBox: "0 0 24 24", className: "h-full w-full", shapeRendering: "crispEdges" as const };
  if (n === 1) return (
    <svg {...p}>
      <rect x="4" y="13" width="14" height="6" fill="#2a1a1a" /><rect x="16" y="11" width="5" height="5" fill="#3a2020" />
      <rect x="6" y="10" width="2" height="3" fill="#c0392b" /><rect x="10" y="9" width="2" height="4" fill="#c0392b" /><rect x="14" y="10" width="2" height="3" fill="#c0392b" />
      <rect x="5" y="19" width="2" height="2" fill="#2a1a1a" /><rect x="15" y="19" width="2" height="2" fill="#2a1a1a" />
    </svg>
  );
  if (n === 2) return (
    <svg {...p}>
      <rect x="8" y="10" width="8" height="9" fill="#8a7a2a" /><rect x="9" y="5" width="6" height="5" fill="#a89a3a" />
      <rect x="10" y="7" width="1" height="1" fill="#c0392b" /><rect x="13" y="7" width="1" height="1" fill="#c0392b" />
      <rect x="5" y="11" width="3" height="6" fill="#8a7a2a" /><rect x="16" y="11" width="3" height="6" fill="#8a7a2a" />
      <rect x="8" y="16" width="8" height="2" fill="#3a3a6a" /><rect x="9" y="19" width="2" height="3" fill="#6a5a1a" /><rect x="13" y="19" width="2" height="3" fill="#6a5a1a" />
    </svg>
  );
  if (n === 3) return (
    <svg {...p}>
      <rect x="5" y="8" width="14" height="12" fill="#7f93a8" /><rect x="8" y="4" width="8" height="6" fill="#94a8bd" />
      <rect x="10" y="6" width="1" height="1" fill="#c0392b" /><rect x="13" y="6" width="1" height="1" fill="#c0392b" />
      <rect x="4" y="14" width="4" height="4" fill="#4a5a78" /><rect x="16" y="14" width="4" height="4" fill="#4a5a78" />
    </svg>
  );
  if (n === 4) return (
    <svg {...p}>
      <rect x="5" y="10" width="14" height="9" fill="#e8dcc0" /><rect x="4" y="8" width="5" height="6" fill="#b89a6a" />
      <rect x="3" y="5" width="2" height="4" fill="#3a3a3a" /><rect x="8" y="5" width="2" height="3" fill="#3a3a3a" />
      <rect x="7" y="19" width="2" height="2" fill="#b89a6a" /><rect x="14" y="19" width="2" height="2" fill="#b89a6a" />
    </svg>
  );
  if (n === 5) return (
    <svg {...p}>
      <rect x="4" y="7" width="4" height="12" fill="#8a2a2a" /><rect x="9" y="11" width="7" height="8" fill="#a83a3a" />
      <rect x="10" y="6" width="5" height="5" fill="#d9a03a" /><rect x="10" y="4" width="5" height="2" fill="#7a1a1a" />
      <rect x="18" y="6" width="1" height="13" fill="#cfcfcf" />
    </svg>
  );
  return (
    <svg {...p}>
      <rect x="6" y="14" width="12" height="6" fill="#e8b8a8" /><rect x="8" y="12" width="8" height="3" fill="#e8b8a8" />
      <rect x="9" y="8" width="1" height="5" fill="#f3c8d0" /><rect x="14" y="8" width="1" height="5" fill="#f3c8d0" />
      <rect x="8" y="8" width="1" height="1" fill="#f3c8d0" /><rect x="15" y="8" width="1" height="1" fill="#f3c8d0" />
      <rect x="10" y="16" width="1" height="1" fill="#2a1a1a" /><rect x="13" y="16" width="1" height="1" fill="#2a1a1a" />
    </svg>
  );
}

function Element({ el }: { el: "fire" | "earth" | "water" }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2" style={{ background: "#3a2414", borderColor: "#c9a05a" }}>
      <svg viewBox="0 0 12 12" className="h-5 w-5" shapeRendering="crispEdges">
        {el === "fire" && (<><rect x="4" y="5" width="4" height="5" fill="#f97316" /><rect x="5" y="2" width="2" height="4" fill="#fb923c" /><rect x="5" y="7" width="2" height="3" fill="#fde047" /></>)}
        {el === "earth" && (<><rect x="5" y="1" width="2" height="2" fill="#f5c46a" /><rect x="3" y="3" width="6" height="2" fill="#f5c46a" /><rect x="2" y="5" width="8" height="2" fill="#e8a33a" /><rect x="3" y="7" width="6" height="2" fill="#e8a33a" /><rect x="5" y="9" width="2" height="2" fill="#c9852a" /></>)}
        {el === "water" && (<><rect x="5" y="1" width="2" height="2" fill="#7fd0ff" /><rect x="4" y="3" width="4" height="2" fill="#4fb3ff" /><rect x="3" y="5" width="6" height="4" fill="#2f8ae0" /><rect x="4" y="9" width="4" height="1" fill="#2f8ae0" /></>)}
      </svg>
    </span>
  );
}

function Silhouette() {
  return (
    <svg viewBox="0 0 12 12" className="h-full w-full" shapeRendering="crispEdges">
      <rect x="4" y="2" width="4" height="4" fill="#a8a090" /><rect x="2" y="7" width="8" height="4" fill="#a8a090" />
    </svg>
  );
}

function Detail({ g, ms, onClose, onPick, onFill }: { g: B; ms: P[]; onClose: () => void; onPick: (m: any) => void; onFill?: () => void }) {
  const info = INFO[g.n];
  const open = g.slots - ms.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-sm overflow-y-auto border-2 p-2" style={{ background: "#c9b48a", borderColor: "#8a6a3a" }} onClick={(e) => e.stopPropagation()}>
        <div className="border px-2 py-2 text-center text-[10px]" style={{ background: "#6a1a12", borderColor: "#3a0a06", color: "#f5c46a" }}>{"NATIONAL ADVENTURERS' GUILD"}</div>
        <div className="mt-2 border" style={{ borderColor: "#2a1a12" }}>
          <p className="px-2 py-2 text-center text-[9px] text-white" style={{ background: "#2a1c18" }}>{g.r}. REQUEST TO PURIFY {g.name}</p>
          <div className="relative flex h-32 items-end justify-center" style={{ background: "linear-gradient(" + info.bg[0] + "," + info.bg[1] + ")" }}>
            <div className="absolute left-2 top-2"><Element el={info.el} /></div>
            <div className="mb-2 h-24 w-24"><Beast n={g.n} /></div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="border" style={{ borderColor: "#3a4a1a" }}>
            <p className="py-1 text-center text-[8px]" style={{ background: "#3a4a1a", color: "#e6f08a" }}>BLESSING EFFECT</p>
            <p className="flex min-h-[64px] items-center justify-center px-1 py-2 text-center text-[8px] leading-relaxed text-white" style={{ background: "#9aa84a" }}>{info.bless}</p>
          </div>
          <div className="border" style={{ borderColor: "#2a1050" }}>
            <p className="py-1 text-center text-[8px]" style={{ background: "#2a1050", color: "#d6a8ff" }}>CORRUPTION EFFECT</p>
            <p className="flex min-h-[64px] items-center justify-center px-1 py-2 text-center text-[8px] leading-relaxed text-white" style={{ background: "#6e4a8e" }}>{info.curse}</p>
          </div>
        </div>
        <p className="mt-2 py-1 text-center text-[9px] text-white" style={{ background: "#7a6040" }}>REQUEST PROGRESS</p>
        <div className="flex items-center gap-2 p-2" style={{ background: "#4a3a2a" }}>
          <div className="flex flex-1 flex-wrap justify-center gap-1.5">
            {Array.from({ length: g.slots }, (_, i) => {
              const m = ms[i];
              if (!m) return (<button key={i} type="button" disabled={!onFill} onClick={() => { onClose(); onFill?.(); }} className="block h-9 w-9 rounded-full border-2 p-1 disabled:opacity-100" style={{ background: "#6a5a48", borderColor: "#c9b48a" }}><Silhouette /></button>);
              return (
                <button key={m.id} type="button" onClick={() => { onClose(); onPick(m); }} className="block h-9 w-9 overflow-hidden rounded-full border-2" style={{ borderColor: "#c9b48a" }}>
                  <img src={gameAvatar(m.username) || m.avatar_url || FB} onError={(e) => { if (!e.currentTarget.src.endsWith(FB)) e.currentTarget.src = FB; }} alt={m.username ?? ""} className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
          <div className="shrink-0 border-2 px-2 py-1 text-center" style={{ background: "#1a1410", borderColor: "#2a1a12" }}>
            <p className="text-[8px] text-dv-emerald">REWARD</p>
            <p className="text-[10px] text-white">{g.pts}</p>
          </div>
        </div>
        <p className="mt-2 px-2 py-4 text-center text-[9px] leading-relaxed text-white" style={{ background: "#4a3c2c" }}>{open <= 0 ? "ALL SLOTS FILLED." : open + (open === 1 ? " SLOT" : " SLOTS") + " OPEN."}</p>
        <button type="button" onClick={onClose} className="mt-2 block w-full border-2 p-2 text-[10px] text-white" style={{ background: "#555", borderColor: "#2a2a2a" }}>CLOSE</button>
      </div>
    </div>
  );
}

export default function GuildRequestBoard({ bosses, rows, onPick, onFill }: { bosses: B[]; rows: P[]; onPick: (m: any) => void; onFill?: (n: number) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const shadow = { textShadow: "0 1px 0 rgba(0,0,0,.7)" };
  const sel = bosses.find((b) => b.n === open) ?? null;
  return (
    <div className="pixel-border relative overflow-hidden bg-dv-panel/95 p-2 shadow-pixel">
      <div className="border px-2 py-2 text-center text-[10px] text-dv-brassLight" style={{ background: "#2a1a12", borderColor: "#b8893a" }}>GUILD REQUEST</div>
      <p className="my-3 px-1 text-center text-[8px] leading-relaxed text-white" style={shadow}>{"COMPLETE THE REQUEST TO PURIFY CORRUPTED TERRAIN AND RECEIVE A REWARD FROM THE NATIONAL ADVENTURERS' GUILD."}</p>
      <div className="border border-dv-line bg-dv-bg/70 px-1 py-3">
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {bosses.map((g) => {
            const ms = rows.filter((m) => m.gr_boss === g.n);
            return (
              <div key={g.n} className="flex min-w-0 flex-col items-center">
                <span className="mb-1 text-[11px] text-white" style={shadow}>{g.r}</span>
                <button type="button" onClick={() => setOpen(g.n)} className="block w-full border-2 border-dv-brass/70 bg-dv-panel2 p-1">
                  <p className="eyebrow text-center text-[9px]">WANTED</p>
                  <div className="my-1 aspect-square border border-dv-line bg-dv-bg p-1"><Beast n={g.n} /></div>
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: g.slots }, (_, i) => (<span key={i} className="text-[8px] leading-none" style={{ color: i < ms.length ? "#f59e0b" : "#6b5a4a" }}>{i < ms.length ? "★" : "✕"}</span>))}
                  </div>
                </button>
                <p className="mt-1 w-full truncate text-center text-[8px] text-white" style={shadow}>{g.name}</p>
                <p className="text-center text-[8px] text-dv-emerald" style={shadow}>{ms.length}/{g.slots} · {g.pts}</p>
                <div className="mt-1 w-full space-y-0.5">
                  {ms.map((m) => (<button key={m.id} type="button" onClick={() => onPick(m)} className="block w-full truncate px-1 text-center text-[9px] text-white" style={{ background: "rgba(0,0,0,.5)" }}>{m.username}</button>))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {sel && <Detail g={sel} ms={rows.filter((m) => m.gr_boss === sel.n)} onClose={() => setOpen(null)} onPick={onPick} onFill={onFill ? () => onFill(sel.n) : undefined} />}
    </div>
  );
}
