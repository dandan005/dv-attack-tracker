"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type RowC = React.ComponentType<{ label: string; value?: string; children?: React.ReactNode }>;
type P = { level: number | null; stage: number | null; dv_map: string | null; gr_boss: number | null };
type Opt = { v: string; label: string };

const MAPS: Opt[] = [
  { v: "wasteland", label: "WASTELAND" },
  { v: "lava", label: "LAVA MTS" },
  { v: "icevale", label: "ICEVALE" },
  { v: "windcliff", label: "WINDCLIFF" },
];
const BOSSES: Opt[] = [1, 2, 3, 4, 5, 6].map((n) => ({ v: String(n), label: `BOSS #${n}` }));

let cache: P | null = null;
const txt = (n: number | null | undefined) => (n == null ? "" : String(n));

function OptionPicker({ title, current, options, onSelect }: { title: string; current: string | null; options: Opt[]; onSelect: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const all: Opt[] = [{ v: "", label: "NOT SET" }, ...options];
  const cur = options.find((o) => o.v === current);

  const popup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xs rounded-xl border-2 border-dv-line bg-dv-panel2"
        style={{ boxShadow: "0 0 0 2px #000, 0 0 24px rgba(212,175,90,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-dv-line bg-dv-panel2 px-3 py-2">
          <p className="text-[10px] tracking-widest text-dv-brassLight">{title}</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="border border-dv-line px-2 py-0.5 text-[10px] text-[#fdf3dc]">X</button>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {all.map((o) => {
            const selected = o.v === (current ?? "");
            return (
              <button
                key={o.v || "none"}
                type="button"
                onClick={() => { setOpen(false); if (!selected) onSelect(o.v === "" ? null : o.v); }}
                className={["flex w-full items-center justify-between rounded-md border px-3 py-3 text-[10px]", selected ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-black/20 text-[#fdf3dc]"].join(" ")}
                style={selected ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}
              >
                <span>{o.label}</span>
                <span className="text-[8px]">{selected ? "●" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={title} className="flex h-6 shrink-0 items-center gap-1 border border-dv-line bg-dv-panel2 px-1.5 text-[9px] text-dv-brassLight">
        {cur ? cur.label : "NOT SET"}
        <span className="text-[7px] text-[#fdf3dc]">▼</span>
      </button>
      {open && typeof document !== "undefined" && createPortal(popup, document.body)}
    </>
  );
}

if (typeof window !== "undefined" && !cache) { fetch("/api/profile").then((r) => (r.ok ? r.json() : null)).then((d: P | null) => { if (d && !cache) cache = d; }).catch(() => {}); }

export function ProfileFields({ Row }: { Row: RowC }) {
  const [p, setP] = useState<P | null>(cache);
  const [lv, setLv] = useState(txt(cache?.level));
  const [st, setSt] = useState(txt(cache?.stage));

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: P | null) => {
        if (d) {
          setP(d);
          setLv(txt(d.level));
          setSt(txt(d.stage));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (p) cache = p;
  }, [p]);

  async function save(patch: Partial<P>): Promise<boolean> {
    const r = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => null);
    if (r && r.ok) {
      setP((d) => d && { ...d, ...patch });
      return true;
    }
    return false;
  }

  async function saveNum(key: "level" | "stage", text: string) {
    if (!p) return;
    const value = text.trim() === "" ? null : Number(text);
    if (value === p[key]) return;
    const ok = await save({ [key]: value } as Partial<P>);
    if (!ok) (key === "level" ? setLv : setSt)(txt(p[key]));
  }

  if (!p) return null;

  const box = "h-6 w-20 border border-dv-line bg-dv-panel2 px-1.5 text-right text-[9px] text-dv-brassLight";

  return (
    <>
      <Row label="Level" value="Shown in the ranking">
        <input type="number" inputMode="numeric" value={lv} onChange={(e) => setLv(e.target.value)} onBlur={() => saveNum("level", lv)} className={box} />
      </Row>
      <Row label="Stage" value="The ranking sorts by this">
        <input type="number" inputMode="numeric" value={st} onChange={(e) => setSt(e.target.value)} onBlur={() => saveNum("stage", st)} className={box} />
      </Row>
          </>
  );
}
