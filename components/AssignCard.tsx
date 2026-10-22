"use client";
import { useEffect, useState } from "react";
import { PixelPanel } from "@/components/PixelPanel";
import DvMapScene from "@/components/DvMapScene";
import GuildRequestBoard from "@/components/GuildRequestBoard";
import { getCycleInfo } from "@/lib/cycle";

type Row = { id: string; username: string | null; dv_map: string | null; gr_boss: number | null };
const TABS = [{ v: "1", label: "G1" }, { v: "2", label: "G2" }];
const SECS = [{ v: "dv", label: "DV MAPS" }, { v: "gr", label: "GUILD REQUEST" }];
const MAPS: [string, string][] = [["wasteland", "WASTELAND PLATEAU"], ["lava", "LAVA MOUNTAINS"], ["icevale", "ICE VALE"], ["windcliff", "WIND CLIFF"]];
const GR = [{ n: 1, r: "I", name: "PURIFY LAND OF HATE", slots: 4, pts: "5,000" }, { n: 2, r: "II", name: "ANCIENT RUINS", slots: 5, pts: "7,500" }, { n: 3, r: "III", name: "FROZEN WOOD", slots: 5, pts: "7,500" }, { n: 4, r: "IV", name: "RISING STRATA", slots: 5, pts: "7,500" }, { n: 5, r: "V", name: "GRAY AREA", slots: 5, pts: "7,500" }, { n: 6, r: "VI", name: "ANCIENT ALTAR", slots: 6, pts: "10,000" }];
const DV_ORDER = ["wasteland", "lava", "icevale", "windcliff"];
const cache: Record<string, Row[]> = {};
let rolesCache: any = null;

const tabCls = (on: boolean) => "h-6 flex-1 border px-2 text-[9px] " + (on ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80");

// Members for one guild view, taken from the dashboard's startup data (same rules as /api/ranking?guild=N).
const pickStartup = (all: any[], v: string) => all.filter((m: any) => String(m.guild_id) === v || (m.guild_id == null && String(m.id).startsWith("roster-")));

export default function AssignCard({ startup }: { startup?: { members: any[]; roles: any } | null } = {}) {
  const [view, setView] = useState("2");
  const [rows, setRows] = useState<Row[]>(() => (startup ? pickStartup(startup.members, "2") : cache["2"] ?? []));
  const [err, setErr] = useState(false);
  const [sec, setSec] = useState("dv");
  const [roles, setRoles] = useState<any>(() => (startup ? startup.roles : rolesCache));
  const [picking, setPicking] = useState<Row | null>(null);
  const [seatMap, setSeatMap] = useState<string | null>(null);
  const [gfBoss, setGfBoss] = useState<number | null>(null);
  useEffect(() => {
    if (startup) { setErr(false); setRows(pickStartup(startup.members, view)); return; }
    let live = true; setErr(false); setRows(cache[view] ?? []);
    fetch("/api/ranking?guild=" + view).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { cache[view] = d.members; if (live) { setRows(d.members); rolesCache = { ...d.roles, me: d.me }; setRoles(rolesCache); } }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [view, startup]);

  const cyc = getCycleInfo();
  const day = cyc.dayNumber;
  const closed = day === 7;
  const locked = day >= 4;

  const unassigned = rows.filter((m) => !MAPS.some(([k]) => k === m.dv_map));
  const staff = !!roles && !!(roles.is_creator || roles.is_admin || roles.is_super_admin); const mine = rows.find((m) => !!roles && m.id === roles.me); const maps = staff ? MAPS : MAPS.filter(([k]) => mine?.dv_map === k); const bosses = staff ? GR : GR.filter((g) => mine?.gr_boss === g.n);
  useEffect(() => { if (roles && !staff && roles.guild_id && view !== String(roles.guild_id)) setView(String(roles.guild_id)); }, [roles, staff, view]);
  const pick = (m: Row) => { if (!locked && staff && canEdit(roles, m)) setPicking(m); };
  const save = async (field: "dv_map" | "gr_boss", value: string | number | null) => {
    if (!picking) return;
    if (await postAssign(picking.id, field, value)) {
      const patch = field === "dv_map" ? { dv_map: value as string | null } : { gr_boss: value as number | null };
      const next = rows.map((m) => (m.id === picking.id ? { ...m, ...patch } : m)); cache[view] = next; setRows(next);
      setPicking(null);
    }
  };
  const fillSeat = async (m: Row) => {
    if (!seatMap) return;
    if (await postAssign(m.id, "dv_map", seatMap)) {
      const next = rows.map((r) => (r.id === m.id ? { ...r, dv_map: seatMap } : r)); cache[view] = next; setRows(next);
      setSeatMap(null);
    }
  };

  const fillBoss = async (m: Row) => {
    if (gfBoss == null) return;
    if (await postAssign(m.id, "gr_boss", gfBoss)) {
      const next = rows.map((r) => (r.id === m.id ? { ...r, gr_boss: gfBoss } : r)); cache[view] = next; setRows(next);
      setGfBoss(null);
    }
  };

  // clear = true wipes this guild's assignments (day 7 reset); otherwise assigns by rank.
  const [autoBusy, setAutoBusy] = useState(false);
  const runAuto = async (silent: boolean, clear = false) => {
    if (!silent && !window.confirm("Auto-assign G" + view + " by rank? This replaces its current DV map and Guild Request assignments.")) return;
    if (autoBusy) return;
    setAutoBusy(true);
    try {
    const plan = rows.map((m, i) => ({
      m,
      dv: clear || i >= 20 ? null : DV_ORDER[i % 4], // ranks 1-4 one per map, then 5+ continue in turn
      gr: clear ? null : i < 6 ? 6 : i < 11 ? 5 : i < 16 ? 4 : i < 20 ? 1 : null,
    })).filter((p) => canEdit(roles, p.m));
    const next = rows.map((r) => ({ ...r }));
    for (const p of plan) {
      const idx = next.findIndex((r) => r.id === p.m.id);
      if (!(await postAssign(p.m.id, "dv_map", p.dv))) break;
      next[idx] = { ...next[idx], dv_map: p.dv };
      if (!(await postAssign(p.m.id, "gr_boss", p.gr))) break;
      next[idx] = { ...next[idx], gr_boss: p.gr };
    }
    cache[view] = next; setRows(next);
    } finally {
      setAutoBusy(false);
    }
  };

  // Day 1: assign by rank once per cycle. Day 7: reset assignments once per cycle.
  useEffect(() => {
    if (!staff || rows.length === 0) return;
    if (day !== 1 && day !== 7) return;
    const key = "dvcycle-" + view + "-" + cyc.cycleStartISO + "-" + day;
    try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch {}
    runAuto(true, day === 7);
  }, [rows, staff, view]);

  if (closed) return (
    <PixelPanel className="animate-rise">
      <p className="eyebrow py-2">ASSIGN CLOSED</p>
      <p className="text-[11px] leading-relaxed text-slate-200/75">Assignments reopen on Day 1 of the next cycle.</p>
    </PixelPanel>
  );

  return (
    <PixelPanel className="animate-rise">
      <div className="mb-3 flex gap-2">
        <select value={sec} onChange={(e) => setSec(e.target.value)} className="h-8 flex-1 border border-dv-brass bg-black/40 px-2 text-[10px] text-dv-brassLight">{SECS.map((s) => (<option key={s.v} value={s.v}>{s.label}</option>))}</select>
        <select value={view} disabled={!staff} onChange={(e) => setView(e.target.value)} className="h-8 flex-1 border border-dv-brass bg-black/40 px-2 text-[10px] text-dv-brassLight">{TABS.map((t) => (<option key={t.v} value={t.v}>{t.label}</option>))}</select>
      </div>
      {locked && <p className="eyebrow py-2">LOCKED UNTIL DAY 1 · VIEW ONLY</p>}
      {staff && !locked && (<button type="button" onClick={() => runAuto(false)} disabled={autoBusy} aria-busy={autoBusy} className="mb-3 flex w-full items-center justify-center gap-3 border border-dv-brass bg-dv-panel2 px-4 py-3 text-[10px] uppercase tracking-[.1em] text-dv-brassLight shadow-pixel-sm hover:bg-black/40 disabled:opacity-80">{autoBusy && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-dv-brassLight border-t-transparent" />}{autoBusy ? "ASSIGNING..." : "AUTO ASSIGN G" + view + " BY RANK"}</button>)}
      {err && <p className="eyebrow py-2">COULD NOT LOAD</p>}

      {gfBoss != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setGfBoss(null)}><div className="pixel-border bg-dv-panel max-h-[80vh] w-full max-w-sm space-y-2 overflow-y-auto p-4 shadow-pixel" onClick={(e) => e.stopPropagation()}>
          <p className="eyebrow py-2">ASSIGN TO BOSS {GR.find((g) => g.n === gfBoss)?.r}</p>
          {rows.filter((m) => m.gr_boss == null && canEdit(roles, m)).map((m) => (<button key={m.id} type="button" onClick={() => fillBoss(m)} className="item-slot block w-full p-2 text-left text-[10px]">{m.username}</button>))}
          {rows.filter((m) => m.gr_boss == null && canEdit(roles, m)).length === 0 && <p className="text-[10px] text-slate-200/70">NO UNASSIGNED PLAYERS</p>}
          <button type="button" onClick={() => setGfBoss(null)} className="item-slot block w-full p-2 text-[10px]">CANCEL</button>
        </div></div>
      )}

      {seatMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSeatMap(null)}><div className="pixel-border bg-dv-panel max-h-[80vh] w-full max-w-sm space-y-2 overflow-y-auto p-4 shadow-pixel" onClick={(e) => e.stopPropagation()}>
          <p className="eyebrow py-2">ADD TO {MAPS.find(([k]) => k === seatMap)?.[1]}</p>
          {unassigned.filter((m) => canEdit(roles, m)).map((m) => (<button key={m.id} type="button" onClick={() => fillSeat(m)} className="item-slot block w-full p-2 text-left text-[10px]">{m.username}</button>))}
          {unassigned.filter((m) => canEdit(roles, m)).length === 0 && <p className="text-[10px] text-slate-200/70">NO UNASSIGNED PLAYERS</p>}
          <button type="button" onClick={() => setSeatMap(null)} className="item-slot block w-full p-2 text-[10px]">CANCEL</button>
        </div></div>
      )}

      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPicking(null)}><div className="pixel-border bg-dv-panel max-h-[80vh] w-full max-w-sm space-y-2 overflow-y-auto p-4 shadow-pixel" onClick={(e) => e.stopPropagation()}>
          <p className="eyebrow py-2">ASSIGN {picking.username} TO {sec === "dv" ? "MAP" : "BOSS"}</p>
          {sec === "dv" && MAPS.map(([k, label]) => { const full = rows.filter((m) => m.dv_map === k).length >= 5; return (<button key={k} type="button" disabled={full} onClick={() => save("dv_map", k)} className="item-slot block w-full p-2 text-left text-[10px] disabled:opacity-40">{label}</button>); })}
          {sec === "gr" && GR.map((g) => { const full = rows.filter((m) => m.gr_boss === g.n).length >= g.slots; return (<button key={g.n} type="button" disabled={full} onClick={() => save("gr_boss", g.n)} className="item-slot block w-full p-2 text-left text-[10px] disabled:opacity-40">{g.r} {g.name}</button>); })}
          <button type="button" onClick={() => save(sec === "dv" ? "dv_map" : "gr_boss", null)} className="item-slot block w-full p-2 text-[10px]">NONE</button>
          <button type="button" onClick={() => setPicking(null)} className="item-slot block w-full p-2 text-[10px]">CANCEL</button>
        </div></div>
      )}

      <div className="space-y-2">
        {sec === "dv" && !staff && roles && !mine?.dv_map && (<p className="eyebrow py-2">NO MAP ASSIGNED YET</p>)}
        {sec === "dv" && maps.map(([k, label]) => (<DvMapScene key={k} k={k} label={label} members={rows.filter((m) => m.dv_map === k)} onPick={pick} onEmpty={staff && !locked ? setSeatMap : undefined} />))}
        {sec === "gr" && !staff && roles && !mine?.gr_boss && (<p className="eyebrow py-2">NO BOSS ASSIGNED YET</p>)}
        {sec === "gr" && (<GuildRequestBoard bosses={bosses} rows={rows} onPick={pick} onFill={staff && !locked ? setGfBoss : undefined} />)}
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
