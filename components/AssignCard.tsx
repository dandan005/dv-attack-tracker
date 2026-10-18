"use client";
import { useEffect, useState } from "react";
import { PixelPanel } from "@/components/PixelPanel";

type Row = { id: string; username: string | null; dv_map: string | null; gr_boss: number | null };
const TABS = [{ v: "1", label: "G1" }, { v: "2", label: "G2" }];
const SECS = [{ v: "dv", label: "DV MAPS" }, { v: "gr", label: "GUILD REQUEST" }];
const MAPS: [string, string][] = [["wasteland", "WASTELAND PLATEAU"], ["lava", "LAVA MOUNTAINS"], ["icevale", "ICE VALE"], ["windcliff", "WIND CLIFF"]];
const GR = [{ n: 1, r: "I", name: "PURIFY LAND OF HATE", slots: 4, pts: "5,000" }, { n: 2, r: "II", name: "ANCIENT RUINS", slots: 5, pts: "7,500" }, { n: 3, r: "III", name: "FROZEN WOOD", slots: 5, pts: "7,500" }, { n: 4, r: "IV", name: "RISING STRATA", slots: 5, pts: "7,500" }, { n: 5, r: "V", name: "GRAY AREA", slots: 5, pts: "7,500" }, { n: 6, r: "VI", name: "ANCIENT ALTAR", slots: 6, pts: "10,000" }];
const cache: Record<string, Row[]> = {};
if (typeof window !== "undefined") { for (const v of ["1", "2"]) fetch("/api/ranking?guild=" + v).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[v] = d.members; }).catch(() => {}); }

const tabCls = (on: boolean) => "h-6 flex-1 border px-2 text-[9px] " + (on ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80");

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
  const pick = (m: Row) => { if (canEdit(roles, m)) setPicking(m); };
  const save = async (field: "dv_map" | "gr_boss", value: string | number | null) => {
    if (!picking) return;
    if (await postAssign(picking.id, field, value)) {
      const patch = field === "dv_map" ? { dv_map: value as string | null } : { gr_boss: value as number | null };
      setRows(rows.map((m) => (m.id === picking.id ? { ...m, ...patch } : m)));
      setPicking(null);
    }
  };

  return (
    <PixelPanel className="animate-rise">
      <div className="mb-3 flex gap-2">{SECS.map((s) => (<button key={s.v} type="button" onClick={() => setSec(s.v)} className={tabCls(sec === s.v)}>{s.label}</button>))}</div>
      <div className="mb-3">
        <select value={view} onChange={(e) => setView(e.target.value)} className="h-8 w-full border border-dv-brass bg-black/40 px-2 text-[10px] text-dv-brassLight">
          {TABS.map((t) => (<option key={t.v} value={t.v}>{t.label}</option>))}
        </select>
      </div>
      {err && <p className="eyebrow py-2">COULD NOT LOAD</p>}

      {picking && (
        <div className="mb-3 space-y-2">
          <p className="eyebrow py-2">ASSIGN {picking.username} TO {sec === "dv" ? "MAP" : "BOSS"}</p>
          {sec === "dv" && MAPS.map(([k, label]) => { const full = rows.filter((m) => m.dv_map === k).length >= 5; return (<button key={k} type="button" disabled={full} onClick={() => save("dv_map", k)} className="item-slot block w-full p-2 text-left text-[10px] disabled:opacity-40">{label}</button>); })}
          {sec === "gr" && GR.map((g) => { const full = rows.filter((m) => m.gr_boss === g.n).length >= g.slots; return (<button key={g.n} type="button" disabled={full} onClick={() => save("gr_boss", g.n)} className="item-slot block w-full p-2 text-left text-[10px] disabled:opacity-40">{g.r} {g.name}</button>); })}
          <button type="button" onClick={() => save(sec === "dv" ? "dv_map" : "gr_boss", null)} className="item-slot block w-full p-2 text-[10px]">NONE</button>
          <button type="button" onClick={() => setPicking(null)} className="item-slot block w-full p-2 text-[10px]">CANCEL</button>
        </div>
      )}

      <div className="space-y-2">
        {sec === "dv" && MAPS.map(([k, label]) => { const ms = rows.filter((m) => m.dv_map === k); return (
          <div key={k} className="item-slot p-2">
            <div className="flex items-center gap-2 mb-2"><span className="flex-1 text-[11px] text-slate-200/80">{label}</span><span className="text-[9px] text-dv-emerald">{ms.length}/5</span></div>
            {ms.map((m) => (<p key={m.id} onClick={() => pick(m)} className="text-[10px] text-slate-200/80 cursor-pointer">{m.username}</p>))}
          </div>); })}
        {sec === "dv" && (
          <div className="item-slot p-2">
            <div className="flex items-center gap-2 mb-2"><span className="flex-1 text-[11px] text-slate-200/80">UNASSIGNED</span><span className="text-[9px] text-dv-emerald">{unassigned.length}</span></div>
            {unassigned.map((m) => (<p key={m.id} onClick={() => pick(m)} className="text-[10px] text-slate-200/80 cursor-pointer">{m.username}</p>))}
          </div>)}
        {sec === "gr" && GR.map((g) => { const ms = rows.filter((m) => m.gr_boss === g.n); return (
          <div key={g.n} className="item-slot p-2">
            <div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-dv-brassLight">{g.r}</span><span className="flex-1 text-[11px] text-slate-200/80">{g.name}</span></div>
            <div className="grid grid-cols-2 gap-1 mb-2"><div><p className="eyebrow">SLOTS</p><p className="text-[10px] mt-1 text-slate-200/80">{ms.length}/{g.slots}</p></div><div><p className="eyebrow">POINTS</p><p className="text-[10px] mt-1 text-dv-emerald">{g.pts}</p></div></div>
            {ms.map((m) => (<p key={m.id} onClick={() => pick(m)} className="text-[10px] text-slate-200/80 cursor-pointer">{m.username}</p>))}
          </div>); })}
      </div>
    </PixelPanel>
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
