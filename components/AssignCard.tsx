"use client";
import { useEffect, useState } from "react";

type Row = { id: string; username: string | null; dv_map: string | null; gr_boss: number | null };
const TABS = [{ v: "1", label: "G1" }, { v: "2", label: "G2" }];
const MAPS: [string, string][] = [["wasteland", "WASTELAND PLATEAU"], ["lava", "LAVA MOUNTAINS"], ["icevale", "ICE VALE"], ["windcliff", "WIND CLIFF"]];
const GR = [{ n: 1, r: "I", name: "PURIFY LAND OF HATE", map: "LAVA", slots: 4, pts: "5,000" }, { n: 2, r: "II", name: "ANCIENT RUINS", map: "WASTELAND", slots: 5, pts: "7,500" }, { n: 3, r: "III", name: "FROZEN WOOD", map: "ICE", slots: 5, pts: "7,500" }, { n: 4, r: "IV", name: "RISING STRATA", map: "WASTELAND", slots: 5, pts: "7,500" }, { n: 5, r: "V", name: "GRAY AREA", map: "LAVA", slots: 5, pts: "7,500" }, { n: 6, r: "VI", name: "ANCIENT ALTAR", map: "WASTELAND", slots: 6, pts: "10,000" }];
const cache: Record<string, Row[]> = {};
if (typeof window !== "undefined") { for (const v of ["1", "2"]) fetch("/api/ranking?guild=" + v).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[v] = d.members; }).catch(() => {}); }

export default function AssignCard() {
  const [view, setView] = useState("2");
  const [rows, setRows] = useState<Row[]>(cache["2"] ?? []);
  const [err, setErr] = useState(false);
  const [sec, setSec] = useState("dv");
  useEffect(() => {
    let live = true; setErr(false); setRows(cache[view] ?? []);
    fetch("/api/ranking?guild=" + view).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[view] = d.members; if (live) setRows(d.members); }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [view]);
  const unassigned = rows.filter((m) => !MAPS.some(([k]) => k === m.dv_map));
  return (
    <div className="space-y-3">
      <div className="flex gap-2">{[["dv", "DV MAPS"], ["gr", "GUILD REQUEST"]].map(([k, l]) => (<button key={k} onClick={() => setSec(k)} className={"pixel-frame px-3 py-2 text-[10px] " + (sec === k ? "bg-dv-brass text-dv-bg" : "")}>{l}</button>))}</div>
      <div className="flex gap-2">
        {TABS.map((t) => (<button key={t.v} onClick={() => setView(t.v)} className={"pixel-frame px-3 py-2 text-[10px] " + (view === t.v ? "bg-dv-brass text-dv-bg" : "")}>{t.label}</button>))}
      </div>
      {err && <p className="text-[10px]">Could not load.</p>}
      {sec === "dv" && MAPS.map(([k, label]) => { const ms = rows.filter((m) => m.dv_map === k); return (<div key={k} className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">{label} ({ms.length}/5)</p>{ms.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>); })}
      {sec === "dv" && (<div className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">UNASSIGNED ({unassigned.length})</p>{unassigned.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>)}
      {sec === "gr" && GR.map((g) => { const ms = rows.filter((m) => m.gr_boss === g.n); return (<div key={g.n} className="pixel-frame p-3"><p className="eyebrow mb-1 text-dv-emerald">{g.r} {g.name} ({ms.length}/{g.slots})</p><p className="mb-2 text-[8px] opacity-70">{g.map} / {g.pts} PTS</p>{ms.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>); })}
    </div>
  );
}
