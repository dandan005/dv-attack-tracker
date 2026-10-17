"use client";
import { useEffect, useState } from "react";
import { rankByTier, rankImg } from "@/lib/ranks";
import { gameAvatar } from "@/lib/gameAvatars";
import { PixelPanel } from "@/components/PixelPanel";

type Row = { id: string; username: string | null; avatar_url: string | null; promotion_tier: number | null; level: number | null; stage: number | null; dv_map: string | null; gr_boss: number | null; guild_id: number | null };
type Data = { me: string; members: Row[] };

const TABS = [{ v: "ALL", label: "GLOBAL" }, { v: "1", label: "G1" }, { v: "2", label: "G2" }];
const MAPS: Record<string, string> = { wasteland: "WASTELAND", lava: "LAVA MTS", icevale: "ICEVALE", windcliff: "WINDCLIFF" };

const cache: Record<string, Data> = {};
const load = (v: string) => fetch("/api/ranking?guild=" + v).then((r) => (r.ok ? r.json() : Promise.reject())).then((d: Data) => { cache[v] = d; return d; });
if (typeof window !== "undefined") { for (const t of TABS) load(t.v).catch(() => {}); }

export function RankingCard() {
  const [view, setView] = useState("ALL");
  const [data, setData] = useState<Data | null>(cache["ALL"] ?? null);
  const [err, setErr] = useState(false);
  const [all, setAll] = useState(false);

  useEffect(() => {
    let off = false;
    setData(cache[view] ?? null);
    setErr(false);
    setAll(false);
    load(view)
      
      .then((d) => { if (!off) setData(d); })
      .catch(() => { if (!off && !cache[view]) setErr(true); });
    return () => { off = true; };
  }, [view]);

  const list = data?.members ?? [];
  const shown = all ? list : list.slice(0, 10);

  return (
    <PixelPanel className="animate-rise">
      <div className="mb-3 flex gap-2">
        {TABS.map((t) => (
          <button key={t.v} type="button" onClick={() => setView(t.v)} className={["h-6 flex-1 border px-2 text-[9px]", t.v === view ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80"].join(" ")} style={t.v === view ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>{t.label}</button>
        ))}
      </div>
      {err && <p className="eyebrow py-2">COULD NOT LOAD</p>}
      {!err && !data && <p className="eyebrow py-2">LOADING...</p>}
      <div className="space-y-2">
        {shown.map((m, i) => {
          const r = rankByTier(m.promotion_tier);
          const isMe = m.id === data?.me;
          const stats: [string, string, string][] = [
            ["LEVEL", m.level != null ? String(m.level) : "-", "text-slate-200/80"],
            ["STAGE", m.stage != null ? String(m.stage) : "-", "text-dv-emerald"],
            ["MAP", m.dv_map ? (MAPS[m.dv_map] ?? m.dv_map) : "-", "text-slate-200/80"],
            ["BOSS", m.gr_boss != null ? String(m.gr_boss) : "-", "text-slate-200/80"],
          ];
          return (
            <div key={m.id} className="item-slot p-2" style={isMe ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>
              <div className="flex items-center gap-2 min-w-0 mb-2">
                <span className="w-5 shrink-0 text-[10px] text-dv-brassLight">{m.stage != null ? i + 1 : "-"}</span>
                <img src={gameAvatar(m.username) || m.avatar_url || "/icons/icon-192.png"} onError={(e) => { if (!e.currentTarget.src.endsWith("/icons/icon-192.png")) e.currentTarget.src = "/icons/icon-192.png"; }} alt="" className="w-7 h-7 pixel-frame border border-dv-line shrink-0 object-cover" />
                <span className="block text-[11px] text-slate-200/80 break-words leading-tight">{m.username || "-"}</span>
                {isMe && <span className="text-[8px] text-dv-emerald shrink-0">(YOU)</span>}
                <span className="flex-1" />
                {r && <span className="flex items-center gap-1 text-[9px] text-slate-200/80 shrink-0"><img src={rankImg(r.file)} alt="" className="h-4 w-4" />{r.name}</span>}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {stats.map(([l, v, c]) => (
                  <div key={l} className="min-w-0"><p className="eyebrow">{l}</p><p className={"truncate text-[10px] mt-1 " + c}>{v}</p></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {list.length > 10 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-3 h-6 w-full border border-dv-line bg-dv-panel2 text-[9px] text-slate-300/80">{all ? "SHOW LESS" : "SHOW ALL (" + list.length + ")"}</button>
      )}
    </PixelPanel>
  );
}
