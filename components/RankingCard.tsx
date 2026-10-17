"use client";
import { useEffect, useState } from "react";
import { rankByTier, rankImg } from "@/lib/ranks";

type Row = { id: string; username: string | null; avatar_url: string | null; promotion_tier: number | null; level: number | null; stage: number | null; dv_map: string | null; gr_boss: number | null; guild_id: number | null };
type Data = { me: string; members: Row[] };

const TABS = [{ v: "ALL", label: "GLOBAL" }, { v: "1", label: "G1" }, { v: "2", label: "G2" }];
const MAPS: Record<string, string> = { wasteland: "WASTELAND", lava: "LAVA MTS", icevale: "ICEVALE", windcliff: "WINDCLIFF" };

export function RankingCard() {
  const [view, setView] = useState("ALL");
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const [all, setAll] = useState(false);

  useEffect(() => {
    let off = false;
    setData(null);
    setErr(false);
    setAll(false);
    fetch("/api/ranking?guild=" + view)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!off) setData(d); })
      .catch(() => { if (!off) setErr(true); });
    return () => { off = true; };
  }, [view]);

  const list = data?.members ?? [];
  const shown = all ? list : list.slice(0, 10);

  return (
    <div className="mt-3 border border-dv-line bg-dv-panel2 p-3">
      <div className="mb-2 text-[10px] tracking-widest text-dv-brassLight">RANKING</div>
      <div className="mb-2 flex gap-2">
        {TABS.map((t) => (
          <button key={t.v} type="button" onClick={() => setView(t.v)} className={["h-6 flex-1 border px-2 text-[9px]", t.v === view ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80"].join(" ")} style={t.v === view ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>{t.label}</button>
        ))}
      </div>
      {err && <div className="py-2 text-[9px] text-slate-300/70">COULD NOT LOAD</div>}
      {!err && !data && <div className="py-2 text-[9px] text-slate-300/70">LOADING...</div>}
      <div className="flex flex-col gap-1">
        {shown.map((m, i) => {
          const r = rankByTier(m.promotion_tier);
          return (
            <div key={m.id} className={["flex items-center gap-2 border px-2 py-1.5", m.id === data?.me ? "border-dv-brass bg-black/40" : "border-dv-line bg-dv-panel2"].join(" ")}>
              <span className="w-5 text-[9px] text-dv-brassLight">{m.stage != null ? i + 1 : "-"}</span>
              {m.avatar_url ? <img src={m.avatar_url} alt="" className="h-6 w-6 shrink-0" /> : <span className="h-6 w-6 shrink-0 bg-black/40" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] text-slate-200">{m.username || "-"}</div>
                <div className="truncate text-[8px] text-slate-300/70">LV {m.level ?? "-"} · {m.dv_map ? (MAPS[m.dv_map] ?? m.dv_map) : "-"} · BOSS {m.gr_boss ?? "-"}</div>
              </div>
              <div className="text-right text-[10px] text-dv-brassLight">{m.stage ?? "-"}</div>
              {r ? <img src={rankImg(r.file)} alt={r.name} title={r.name} className="h-6 w-6 shrink-0" style={{ imageRendering: "pixelated" }} /> : <span className="h-6 w-6 shrink-0" />}
            </div>
          );
        })}
      </div>
      {list.length > 10 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-2 h-6 w-full border border-dv-line bg-dv-panel2 text-[9px] text-slate-300/80">{all ? "SHOW LESS" : "SHOW ALL (" + list.length + ")"}</button>
      )}
    </div>
  );
}
