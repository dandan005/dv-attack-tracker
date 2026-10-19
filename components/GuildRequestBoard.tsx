"use client";

type P = { id: string; username: string | null; gr_boss: number | null };
type B = { n: number; r: string; name: string; slots: number; pts: string };

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

export default function GuildRequestBoard({ bosses, rows, onPick }: { bosses: B[]; rows: P[]; onPick: (m: any) => void }) {
  const shadow = { textShadow: "0 1px 0 rgba(0,0,0,.7)" };
  return (
    <div className="pixel-border relative overflow-hidden p-2" style={{ background: "linear-gradient(#2f4a1e, #1a1208 55%, #2f4a1e)" }}>
      <div className="border px-2 py-2 text-center text-[10px] text-dv-brassLight" style={{ background: "#2a1a12", borderColor: "#b8893a" }}>GUILD REQUEST</div>
      <p className="my-3 px-1 text-center text-[8px] leading-relaxed text-white/85" style={shadow}>{"COMPLETE THE REQUEST TO PURIFY CORRUPTED TERRAIN AND RECEIVE A REWARD FROM THE NATIONAL ADVENTURERS' GUILD."}</p>
      <div className="px-1 py-3" style={{ background: "#3a2414", borderTop: "3px solid #7a4c28", borderBottom: "3px solid #7a4c28" }}>
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {bosses.map((g) => {
            const ms = rows.filter((m) => m.gr_boss === g.n);
            return (
              <div key={g.n} className="flex min-w-0 flex-col items-center">
                <span className="mb-1 text-[11px] text-white" style={shadow}>{g.r}</span>
                <div className="w-full border-2 p-1" style={{ background: "#d9c39a", borderColor: "#8a6a3a" }}>
                  <p className="text-center text-[9px]" style={{ color: "#5a3a1a" }}>WANTED</p>
                  <div className="my-1 aspect-square border-2 p-1" style={{ background: "#4a3a30", borderColor: "#8a4a1a" }}><Beast n={g.n} /></div>
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: g.slots }, (_, i) => (<span key={i} className="text-[8px] leading-none" style={{ color: i < ms.length ? "#f59e0b" : "#6b5a4a" }}>{i < ms.length ? "★" : "✕"}</span>))}
                  </div>
                </div>
                <p className="mt-1 w-full truncate text-center text-[8px] text-white/85" style={shadow}>{g.name}</p>
                <p className="text-center text-[8px] text-dv-emerald" style={shadow}>{ms.length}/{g.slots} · {g.pts}</p>
                <div className="mt-1 w-full space-y-0.5">
                  {ms.map((m) => (<button key={m.id} type="button" onClick={() => onPick(m)} className="block w-full truncate px-1 text-center text-[9px] text-white" style={{ background: "rgba(0,0,0,.5)" }}>{m.username}</button>))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
