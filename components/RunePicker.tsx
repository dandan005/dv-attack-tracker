"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { RUNE_BY_NAME, RUNE_ICONS, runeTiers, tierColors, tierStyles, type FlatRune } from "@/lib/runes";
import { getCycleInfo } from "@/lib/cycle";
import type { RunePick } from "@/lib/useRunePicks";

// Card skin per rune tier (matches the in-game frames: Mythic blue, Immortal gold, Legendary orange).
const SKINS: Record<string, string> = { Mythic: "mythic", Immortal: "immortal", Legendary: "legendary" };

// Recommendation order: attack first, then exploration, then cooking, then everything else.
const CATEGORY_PRIORITY = { attack: 0, exploration: 1, cooking: 2, other: 3 } as const;
function runeCategory(r: { name: string; effect: string }): keyof typeof CATEGORY_PRIORITY {
  const t = `${r.name} ${r.effect}`;
  if (/dmg|damage|atk|onigiri|skill|subjugation/i.test(t)) return "attack";
  if (/explor|trace|terrain|campfire|region/i.test(t)) return "exploration";
  if (/dish|cook|ingredient|chef|resource|recipe|materials|shrimp|rice|meat|lettuce|honey|caviar|truffle|basil|cheese|potato|tomato|peanut|corn|strawberry|sugar|tuna|cacao|chili|wheat|egg|milk|bean|stick/i.test(t)) return "cooking";
  return "other";
}

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

  // Recommendation: the best unclaimed rune, by category first (attack, exploration, cooking, other), then tier order.
  const cards = offers.map((n) => (n ? RUNE_BY_NAME.get(n) ?? null : null)).filter(Boolean) as FlatRune[];
  const available = cards.filter((c) => !takenBy.has(c.name));
  const score = (r: FlatRune) => CATEGORY_PRIORITY[runeCategory(r)] * 1000 + r.rank;
  const recommended = available.length ? available.reduce((a, b) => (score(b) < score(a) ? b : a)).name : null;

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
  const panel = "pixel-border max-h-[88vh] w-full max-w-sm space-y-3 overflow-y-auto no-scrollbar bg-dv-panel p-4 shadow-pixel";

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
              <button key={i} type="button" onClick={() => (o ? clearSlot(i) : setActive(i))} className={"item-slot flex h-16 flex-col items-center justify-center p-1 text-center text-[8px] " + (active === i ? "border-dv-brass text-dv-brassLight" : "text-[#fdf3dc]")}>
                {o ? <span className="line-clamp-3 leading-tight">{o}</span> : <span className="text-[#fdf3dc]">OPTION {i + 1}</span>}
                {o && <span className="mt-1 text-[7px] text-[#fdf3dc]">TAP TO CLEAR</span>}
              </button>
            ))}
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search runes" className="w-full border border-dv-line bg-black/30 px-3 py-2 text-xs text-slate-100 outline-none" />
          <div className="max-h-[38vh] space-y-3 overflow-y-auto no-scrollbar pr-1">
            {groups.map((t) => (
              <div key={t.name}>
                <p className={"eyebrow mb-1 " + tierStyles[t.accent].text}>{t.name.toUpperCase()}</p>
                <div className="space-y-1">
                  {t.groups.flatMap((g) => g.runes).map((r) => {
                    const slot = offers.indexOf(r.name);
                    return (
                      <button key={r.name} type="button" disabled={slot !== -1} onClick={() => tapRune(r.name)} className="item-slot block w-full p-2 text-left disabled:opacity-40">
                        <span className="flex items-center gap-2" style={{ ["--rc" as string]: tierColors[t.accent] } as CSSProperties}>
                          {RUNE_ICONS[r.name] && <span className="rune-icon shrink-0" aria-hidden="true" style={{ maskImage: `url(/runes/${RUNE_ICONS[r.name]}.png)`, WebkitMaskImage: `url(/runes/${RUNE_ICONS[r.name]}.png)`, width: 18, height: 18 } as CSSProperties} />}
                          <span className={"block text-[10px] " + tierStyles[t.accent].text}>{r.name}{slot !== -1 && <span className="ml-2 text-[8px] text-[#fdf3dc]">OPTION {slot + 1}</span>}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-[10px] text-[#fdf3dc]">No runes match that search.</p>}
          </div>
          <button type="button" onClick={goChoose} disabled={!complete} className="item-slot block w-full p-2 text-[10px] disabled:opacity-40">
            {complete ? "SHOW THE 3 RUNES" : `PICK ${3 - filled.length} MORE`}
          </button>
          <button type="button" onClick={onClose} className="block w-full text-[9px] uppercase tracking-[.1em] text-[#fdf3dc]">Later</button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell} onClick={onClose}>
      <div className={panel.replace("max-w-sm", "max-w-md")} onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow text-center">SELECT RUNE // DAY {day}</p>
        <div className="grid grid-cols-3 gap-2 pt-3">
          {cards.map((c) => {
            const isTaken = takenBy.has(c.name);
            const isSel = choice === c.name;
            const col = tierColors[c.accent];
            return (
              <button
                key={c.name}
                type="button"
                disabled={isTaken}
                onClick={() => setChoice(c.name)}
                data-skin={SKINS[c.tier] ?? "legendary"}
                style={{ ["--rc" as string]: col } as CSSProperties}
                className={"rune-slab block text-center " + (isSel ? "is-selected" : "")}
              >
                <span className="rune-gem" aria-hidden="true" />
                <span className="flex h-[56px] items-center justify-center">
                  {c.icon && <span className="rune-icon" aria-hidden="true" style={{ maskImage: `url(/runes/${c.icon}.png)`, WebkitMaskImage: `url(/runes/${c.icon}.png)` } as CSSProperties} />}
                </span>
                <span className="rune-title flex h-[42px] items-center justify-center">{c.name}</span>
                <span className="rune-divider mt-2 block" aria-hidden="true" />
                <span
                  className="mb-2 mt-2 block min-h-0 flex-1 overflow-y-auto no-scrollbar rounded-sm border bg-black/30 px-2 py-1.5 text-[9px] leading-snug text-[#fdf3dc]"
                  style={{ borderColor: "color-mix(in srgb, var(--frame-out) 60%, transparent)" }}
                >
                  {c.effect}
                </span>
                <span className="mt-auto flex h-[18px] items-center justify-center gap-1">
                  {c.name === recommended && !isTaken && <span className="rune-badge">RECOMMENDED</span>}
                  {isTaken && <span className="rune-badge rune-badge--dim">TAKEN</span>}
                  {c.name === mine && <span className="rune-badge rune-badge--dim">YOURS</span>}
                </span>
                <span className="rune-foot" aria-hidden="true" />
              </button>
            );
          })}
        </div>
        {err && <p className="text-[10px] text-rose-300">{err}</p>}
        <button type="button" onClick={() => choice && save(choice)} disabled={!choice || busy} className="item-slot block w-full p-2 text-[10px] disabled:opacity-40">
          {busy ? "SAVING..." : "SELECT"}
        </button>
        <div className="flex justify-between text-[9px] uppercase tracking-[.1em] text-[#fdf3dc]">
          <button type="button" onClick={() => setStep("offer")}>Edit options</button>
          {mine ? <button type="button" onClick={() => save(null)} disabled={busy}>Clear my pick</button> : <button type="button" onClick={onClose}>Later</button>}
        </div>
      </div>
    </div>
  );
}

