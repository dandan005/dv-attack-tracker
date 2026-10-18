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
  const [roles, setRoles] = useState<any>(null);
  const [picking, setPicking] = useState<Row | null>(null);
  useEffect(() => {
    let live = true; setErr(false); setRows(cache[view] ?? []);
    fetch("/api/ranking?guild=" + view).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[view] = d.members; if (live) { setRows(d.members); setRoles({ ...d.roles, me: d.me }); } }).catch(() => { if (live) setErr(true); });
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
{picking && sec === "dv" && (<div className="pixel-frame p-3 space-y-2"><p className="eyebrow text-dv-emerald">ASSIGN {picking.username} TO MAP</p>{MAPS.map(([k, label]) => (<button key={k} disabled={rows.filter((m) => m.dv_map === k).length >= 5} onClick={async () => { if (await postAssign(picking.id, "dv_map", k)) { setRows(rows.map((m) => (m.id === picking.id ? { ...m, dv_map: k } : m))); setPicking(null); } }} className="pixel-frame block w-full px-3 py-2 text-[10px] disabled:opacity-40">{label}</button>))}<button onClick={async () => { if (await postAssign(picking.id, "dv_map", null)) { setRows(rows.map((m) => (m.id === picking.id ? { ...m, dv_map: null } : m))); setPicking(null); } }} className="pixel-frame block w-full px-3 py-2 text-[10px]">NONE</button><button onClick={() => setPicking(null)} className="pixel-frame block w-full px-3 py-2 text-[10px]">CANCEL</button></div>)}
{picking && sec === "gr" && (<div className="space-y-2"><p className="eyebrow py-2">ASSIGN {picking.username} TO BOSS</p>{GR.map((g) => { const full = rows.filter((m) => m.gr_boss === g.n).length >= g.slots; return (<button key={g.n} type="button" disabled={full} onClick={async () => { if (await postAssign(picking.id, "gr_boss", g.n)) { setRows(rows.map((m) => (m.id === picking.id ? { ...m, gr_boss: g.n } : m))); setPicking(null); } }} className="item-slot block w-full p-2 text-left disabled:opacity-40"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-dv-brassLight">{g.r}</span><span className="text-[11px] text-slate-200/80">{g.name}</span></div><div className="grid grid-cols-2 gap-1"><div><p className="eyebrow">SLOTS</p><p className="text-[10px] mt-1 text-slate-200/80">{g.slots}</p></div><div><p className="eyebrow">POINTS</p><p className="text-[10px] mt-1 text-dv-emerald">{g.pts}</p></div></div></button>); })}<button type="button" onClick={async () => { if (await postAssign(picking.id, "gr_boss", null)) { setRows(rows.map((m) => (m.id === picking.id ? { ...m, gr_boss: null } : m))); setPicking(null); } }} className="item-slot block w-full p-2 text-[10px]">NONE</button><button type="button" onClick={() => setPicking(null)} className="item-slot block w-full p-2 text-[10px]">CANCEL</button></div>)}
      {sec === "dv" && MAPS.map(([k, label]) => { const ms = rows.filter((m) => m.dv_map === k); return (<div key={k} className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">{label} ({ms.length}/5)</p>{ms.map((m) => (<p key={m.id} onClick={() => canEdit(roles, m) && setPicking(m)} className="text-[10px] cursor-pointer">{m.username}</p>))}</div>); })}
      {sec === "dv" && (<div className="pixel-frame p-3"><p className="eyebrow mb-2 text-dv-emerald">UNASSIGNED ({unassigned.length})</p>{unassigned.map((m) => (<p key={m.id} className="text-[10px]">{m.username}</p>))}</div>)}
      {sec === "gr" && GR.map((g) => { const ms = rows.filter((m) => m.gr_boss === g.n); return (<div key={g.n} className="pixel-frame p-3"><p className="eyebrow mb-1 text-dv-emerald">{g.r} {g.name} ({ms.length}/{g.slots})</p><p className="mb-2 text-[8px] opacity-70">{g.pts} PTS</p>{ms.map((m) => (<p key={m.id} onClick={() => canEdit(roles, m) && setPicking(m)} className="text-[10px] cursor-pointer">{m.username}</p>))}</div>); })}
    </div>
  );
}

function canEdit(roles: any, m: Row): boolean {
  if (!roles) return false;
  if (roles.is_creator) return true;
  const isRoster = m.id.startsWith("roster-");
  const staff = roles.is_admin || roles.is_super_admin;
  const sameGuild = (m as any).guild_id === null || (m as any).guild_id === roles.guild_id;
  if (staff && sameGuild) return true;
  return !isRoster && m.id === roles.me;
}

async function postAssign(id: string, field: "dv_map" | "gr_boss", value: string | number | null): Promise<boolean> {
  const r = await fetch("/api/assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, field, value }) });
  if (!r.ok) alert("Save failed (" + r.status + ")");
  return r.ok;
}
