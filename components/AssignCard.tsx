"use client";
import { useEffect, useState } from "react";

type Row = { id: string; username: string | null; dv_map: string | null; gr_boss: number | null };
const TABS = [{ v: "1", label: "G1" }, { v: "2", label: "G2" }];
const MAPS: [string, string][] = [["wasteland", "WASTELAND PLATEAU"], ["lava", "LAVA MOUNTAINS"], ["icevale", "ICE VALE"], ["windcliff", "WIND CLIFF"]];
const cache: Record<string, Row[]> = {};
if (typeof window !== "undefined") { for (const v of ["1", "2"]) fetch("/api/ranking?guild=" + v).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[v] = d.members; }).catch(() => {}); }

export default function AssignCard() {
  const [view, setView] = useState("2");
  const [rows, setRows] = useState<Row[]>(cache["2"] ?? []);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true; setErr(false); setRows(cache[view] ?? []);
    fetch("/api/ranking?guild=" + view).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[view] = d.members; if (live) setRows(d.members); }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [view]);
  const unassigned = rows.filter((m) => !MAPS.some(([k]) => k === m.dv_map));
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {TABS.map((t) => (<button key={t.v} onClick={() => setView(t.v)} className={"pixel-frame px-3 py-2 text-[10px] " + (view === t.v ? "bg-dv-brass text-dv-bg" : "")}>{t.label}</button>))}
      </div>
      {err && <p className="text-[10px]">Could not load.</p>}
      {MAPS.map(([k, label]) => { const ms = rows.filter((m) => m.dv_map === k); return (<div key={k} className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">{label} ({ms.length}/5)</p>{ms.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>); })}
      <div className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">UNASSIGNED ({unassigned.length})</p>{unassigned.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>
    </div>
  );
}
