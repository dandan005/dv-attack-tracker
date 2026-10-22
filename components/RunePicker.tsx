"use client";
import { useMemo, useState } from "react";
import { RUNE_BY_NAME, runeTiers, tierStyles, type FlatRune } from "@/lib/runes";
import { getCycleInfo } from "@/lib/cycle";
import type { RunePick } from "@/lib/useRunePicks";

type Props = { day: number; picks: RunePick[]; meId: string | null; onClose: () => void; onSaved: () => void };

// Options the game offered are remembered per browser for this cycle and day, so reopening skips step 1.
function loadOffers(key: string): (string | null)[] {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "null");
    if (Array.isArray(arr) && arr.length === 3) return arr.map((x) => (typeof x === "string" && RUNE_BY_NAME.has(x) ? x : null));
  } catch {
    /* ignore */
  }
  return [null, null, null];
}

export function RunePicker({ day, picks, meId, onClose, onSaved }: Props) {
  const cycle = getCycleInfo().cycleStartISO;
  const storageKey = `dv-rune-offer:${cycle}:${day}`;
  const [offers, setOffers] = useState<(string | null)[]>(() => loadOffers(storageKey));
  const [step, setStep] = useState<"offer" | "choose">("offer");
  const [active, setActive] = useState<number>(() => Math.max(0, offers.findIndex((o) => !o)));
  const [query, setQuery] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const mine = picks.find((p) => p.day_number === day && p.member_id === meId)?.rune_name ?? null;
  // Runes already claimed by someone else in the guild for this day.
  const takenBy = useMemo(() => {
    const m = new Map<string, string>();
    picks.forEach((p) => { if (p.day_number === day && p.member_id !== meId) m.set(p.rune_name, p.username); });
    return m;
  }, [picks, day, meId]);

  const filled = offers.filter(Boolean) as string[];
  const complete = filled.length === 3;

  function saveOffers(next: (string | null)[]) {
    setOffers(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function tapRune(name: string) {
    if (offers.includes(name)) return;
    const next = [...offers];
    next[active] = name;
    saveOffers(next);
    const nextEmpty = next.findIndex((o, i) => !o && i > active);
    const anyEmpty = next.findIndex((o) => !o);
    setActive(nextEmpty !== -1 ? nextEmpty : anyEmpty !== -1 ? anyEmpty : active);
  }

  function clearSlot(i: number) {
    const next = [...offers];
    next[i] = null;
    saveOffers(next);
    setActive(i);
  }

  // Recommendation: the best rune (lowest rank) that nobody else has claimed.
  const cards = offers.map((n) => (n ? RUNE_BY_NAME.get(n) ?? null : null)).filter(Boolean) as FlatRune[];
  const available = cards.filter((c) => !takenBy.has(c.name));
  const recommended = available.length ? available.reduce((a, b) => (b.rank < a.rank ? b : a)).name : null;

  function goChoose() {
    if (!complete) return;
    setChoice(mine && filled.includes(mine) ? mine : null);
    setErr("");
    setStep("choose");
  }

  async function save(rune: string | null) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/rune-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, rune }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || "Could not save. Try again.");
        onSaved(); // refresh so taken runes show up
        return;
      }
      onSaved();
      onClose();
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const shell = "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4";
  const panel = "pixel-border max-h-[88vh] w-full max-w-sm space-y-3 overflow-y-auto bg-dv-panel p-4 shadow-pixel";

  if (step === "offer") {
    const q = query.trim().toLowerCase();
    const groups = runeTiers
      .map((t) => ({ ...t, groups: t.groups.map((g) => ({ ...g, runes: g.runes.filter((r) => !q || `${r.name} ${r.effect}`.toLowerCase().includes(q)) })) }))
      .map((t) => ({ ...t, groups: t.groups.filter((g) => g.runes.length) }))
      .filter((t) => t.groups.length);
    return (
      <div className={shell} onClick={onClose}>
        <div className={panel} onClick={(e) => e.stopPropagation()}>
          <p className="eyebrow">DAY {day} // RUNE OFFER</p>
          <p className="text-[10px] text-dv-brassLight">Tap the 3 runes the game is offering you.</p>
          <div className="grid grid-cols-3 gap-2">
            {offers.map((o, i) => (
              <button key={i} type="button" onClick={() => (o ? clearSlot(i) : setActive(i))} className={"item-slot flex h-16 flex-col items-center justify-center p-1 text-center text-[8px] " + (active === i ? "border-dv-brass text-dv-brassLight" : "text-slate-200/70")}>
                {o ? <span className="line-clamp-3 leading-tight">{o}</span> : <span className="text-slate-300/50">OPTION {i + 1}</span>}
                {o && <span className="mt-1 text-[7px] text-slate-300/40">TAP TO CLEAR</span>}
              </button>
            ))}
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search runes" className="w-full border border-dv-line bg-black/30 px-3 py-2 text-xs text-slate-100 outline-none" />
          <div className="max-h-[38vh] space-y-3 overflow-y-auto pr-1">
            {groups.map((t) => (
              <div key={t.name}>
                <p className={"eyebrow mb-1 " + tierStyles[t.accent].text}>{t.name.toUpperCase()}</p>
                <div className="space-y-1">
                  {t.groups.flatMap((g) => g.runes).map((r) => {
                    const slot = offers.indexOf(r.name);
                    return (
                      <button key={r.name} type="button" disabled={slot !== -1} onClick={() => tapRune(r.name)} className="item-slot block w-full p-2 text-left disabled:opacity-40">
                        <span className={"block text-[10px] " + tierStyles[t.accent].text}>{r.name}{slot !== -1 && <span className="ml-2 text-[8px] text-slate-300/60">OPTION {slot + 1}</span>}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-[10px] text-slate-300/60">No runes match that search.</p>}
          </div>
          <button type="button" onClick={goChoose} disabled={!complete} className="item-slot block w-full p-2 text-[10px] disabled:opacity-40">
            {complete ? "SHOW THE 3 RUNES" : `PICK ${3 - filled.length} MORE`}
          </button>
          <button type="button" onClick={onClose} className="block w-full text-[9px] uppercase tracking-[.1em] text-slate-300/60">Later</button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell} onClick={onClose}>
      <div className={panel} onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow text-center">SELECT RUNE // DAY {day}</p>
        <div className="space-y-2">
          {cards.map((c) => {
            const isTaken = takenBy.has(c.name);
            const isSel = choice === c.name;
            const st = tierStyles[c.accent];
            return (
              <button
                key={c.name}
                type="button"
                disabled={isTaken}
                onClick={() => setChoice(c.name)}
                className={"block w-full border-2 p-3 text-left disabled:opacity-50 " + (isSel ? "border-dv-brassLight bg-dv-brass/20" : "border-dv-brass/60 bg-black/30")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={"text-xs " + st.text}>{c.name}</span>
                  <span className="flex shrink-0 gap-1">
                    {c.name === recommended && !isTaken && <span className="bg-dv-brass px-1.5 py-0.5 text-[8px] text-black">RECOMMENDED</span>}
                    {isTaken && <span className="border border-dv-line px-1.5 py-0.5 text-[8px] text-slate-300/70">TAKEN · {takenBy.get(c.name)}</span>}
                    {c.name === mine && <span className="border border-dv-emerald/60 px-1.5 py-0.5 text-[8px] text-dv-emerald">YOURS</span>}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-200/70">{c.effect}</p>
              </button>
            );
          })}
        </div>
        {err && <p className="text-[10px] text-rose-300">{err}</p>}
        <button type="button" onClick={() => choice && save(choice)} disabled={!choice || busy} className="item-slot block w-full p-2 text-[10px] disabled:opacity-40">
          {busy ? "SAVING..." : "SELECT"}
        </button>
        <div className="flex justify-between text-[9px] uppercase tracking-[.1em] text-slate-300/60">
          <button type="button" onClick={() => setStep("offer")}>Edit options</button>
          {mine ? <button type="button" onClick={() => save(null)} disabled={busy}>Clear my pick</button> : <button type="button" onClick={onClose}>Later</button>}
        </div>
      </div>
    </div>
  );
}

