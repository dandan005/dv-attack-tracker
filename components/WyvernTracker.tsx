"use client";

import { useState } from "react";
import { PixelPanel, PixelHeader } from "./PixelPanel";

type Element = "wind" | "fire" | "earth" | "water";

const ELEMENTS: { key: Element; label: string; hint: string }[] = [
  { key: "wind", label: "WIND", hint: "swift" },
  { key: "fire", label: "FIRE", hint: "fierce" },
  { key: "earth", label: "EARTH", hint: "steady" },
  { key: "water", label: "WATER", hint: "deep" },
];

type BossSlot = { name: string; image: string; alt: string };

const BOSS_SLOTS: Record<Element, BossSlot> = {
  wind: { name: "BOSS SLOT - WIND", image: "", alt: "Wind boss portrait slot" },
  fire: { name: "BOSS SLOT — FIRE", image: "", alt: "Fire boss portrait slot" },
  earth: { name: "Bardoran", — image: "/bosses/bardoran-portrait.jpg", alt: "Bardoran pixel dragon portrait" },
  water: { name: "BOSS SLOT — WATER", image: "", alt: "Water boss portrait slot" },
};

function PixelElementArt({ element }: { element: Element }) {
  return <img className="element-pixel-art" src={"/elements/" + element + ".png"} alt="" draggable={false} />;
}

function WyvernCrest() {
  return (
    <svg className="wyvern-crest" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="3" y="2" width="2" height="3" fill="currentColor" /><rect x="11" y="2" width="2" height="3" fill="currentColor" />
      <rect x="5" y="4" width="6" height="8" fill="currentColor" /><rect x="3" y="6" width="2" height="5" fill="currentColor" /><rect x="11" y="6" width="2" height="5" fill="currentColor" />
      <rect x="6" y="6" width="1" height="1" fill="#fff2bd" /><rect x="9" y="6" width="1" height="1" fill="#fff2bd" /><rect x="7" y="9" width="2" height="1" fill="#080a18" />
      <rect x="2" y="12" width="3" height="2" fill="currentColor" /><rect x="11" y="12" width="3" height="2" fill="currentColor" />
    </svg>
  );
}

function BossPortrait({ element, boss }: { element: Element; boss: BossSlot }) {
  return (
    <div className={"boss-slot boss-slot--" + element}>
      <div className="boss-slot__header">
        <span className="eyebrow">WYVERN BOSS</span>
        <span className="boss-slot__element">{element.toUpperCase()} SLOT</span>
      </div>
      <div className="boss-portrait">
        {boss.image ? (
          <img src={boss.image} alt={boss.alt} />
        ) : (
          <div className="boss-portrait__empty"><span className="boss-portrait__glyph">?</span><span>PORTRAIT SLOT</span></div>
        )}
      </div>
      <div className="boss-name-row">
        <span className={"element-badge element-badge--" + element}>
          <span className="element-orb element-orb--sm"><PixelElementArt element={element} /></span>
        </span>
        <p className="boss-name">{boss.name}</p>
      </div>
    </div>
  );
}

export function WyvernTracker({
  current,
  setBy,
  onSelect,
}: {
  current: Element | null;
  setBy: string | null;
  onSelect: (el: Element) => Promise<void>;
}) {
  const [pending, setPending] = useState<Element | null>(null);
  const [bursting, setBursting] = useState<Element | null>(null);
  const [changing, setChanging] = useState(false);

  const boss = current ? BOSS_SLOTS[current] : null;
  const showPicker = !current || changing;

  async function handleSelect(el: Element) {
    setBursting(el);
    setPending(el);
    try {
      await onSelect(el);
      setChanging(false);
    } finally {
      setPending(null);
      window.setTimeout(() => setBursting((value) => (value === el ? null : value)), 900);
    }
  }

  return (
    <PixelPanel className="mb-5 animate-rise pb-5">
      <PixelHeader icon={<WyvernCrest />} title="WYVERN TRACE" right={<span className="text-[10px] text-dv-bg/70 tracking-wider">RAID SIGNAL</span>} />

      {showPicker && (
        <>
          <div className="mb-4">
            <p className="text-[11px] text-dv-brassLight">What element is the guild hunting?</p>
            <p className="text-[10px] text-slate-300/55 mt-1">Broadcast the current trace so everyone is synced.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {ELEMENTS.map((el) => {
              const active = current === el.key;
              const isBursting = bursting === el.key;
              return (
                <button
                  key={el.key}
                  type="button"
                  aria-pressed={active}
                  aria-label={"Set wyvern trace to " + el.label.toLowerCase()}
                  disabled={pending !== null}
                  onClick={() => handleSelect(el.key)}
                  className={["element-choice", "element-choice--" + el.key, active ? "is-active" : "", isBursting ? "is-bursting" : "", pending === el.key ? "is-pending" : ""].join(" ")}
                >
                  <span className="element-orb"><PixelElementArt element={el.key} /></span>
                  <span className="element-label">{el.label}</span>
                  <span className="element-state">{active ? "TRACE SET" : el.hint.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {changing && (
            <button type="button" onClick={() => setChanging(false)} className="text-[9px] text-slate-300/55 underline underline-offset-2 mb-1">
              Cancel
            </button>
          )}
        </>
      )}

      {!showPicker && current && boss && (
        <>
          <div className="flex items-center justify-end mb-3">
            <span className="status-chip">SYNCED</span>
          </div>
          <BossPortrait element={current} boss={boss} />
        </>
      )}

      {current && !changing && (
        <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 mt-1 text-[10px] text-dv-brassLight flex items-start justify-between gap-2">
          <span className="flex items-start gap-2">
            <span className="text-dv-violet">◆</span>
            <span>{current.toUpperCase()} trace locked for this raid{setBy ? " · set by " + setBy : ""}.</span>
          </span>
          <button type="button" onClick={() => setChanging(true)} className="text-dv-violet underline underline-offset-2 shrink-0">
            Change
          </button>
        </div>
      )}
    </PixelPanel>
  );
}
