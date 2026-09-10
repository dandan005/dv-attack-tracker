"use client";

import { type ReactNode, useState } from "react";
import { PixelPanel, PixelHeader } from "./PixelPanel";

type Element = "wind" | "fire" | "earth" | "water";

const ELEMENTS: { key: Element; label: string; hint: string }[] = [
  { key: "wind", label: "WIND", hint: "swift" },
  { key: "fire", label: "FIRE", hint: "fierce" },
  { key: "earth", label: "EARTH", hint: "steady" },
  { key: "water", label: "WATER", hint: "deep" },
];

type BossSlot = { name: string; image: string; alt: string };

/* Editable roster slots: replace the name and image values as each boss is confirmed. */
const BOSS_SLOTS: Record<Element, BossSlot> = {
  wind: { name: "Bardoran", image: "/bosses/bardoran-portrait.jpg", alt: "Bardoran pixel dragon portrait" },
  fire: { name: "BOSS SLOT — FIRE", image: "", alt: "Fire boss portrait slot" },
  earth: { name: "BOSS SLOT — EARTH", image: "", alt: "Earth boss portrait slot" },
  water: { name: "BOSS SLOT — WATER", image: "", alt: "Water boss portrait slot" },
};

function PixelElementArt({ element }: { element: Element }) {
  const frame = (name: string, children: ReactNode) => (
    <g className={"sprite-frame sprite-frame--" + name}>{children}</g>
  );

  if (element === "fire") {
    return (
      <svg className="element-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        {frame("a", <><rect x="7" y="1" width="2" height="3" fill="#ffe3a1" /><rect x="5" y="4" width="6" height="3" fill="currentColor" /><rect x="4" y="7" width="8" height="5" fill="currentColor" /><rect x="6" y="12" width="4" height="2" fill="#ff6d6d" /><rect x="7" y="5" width="2" height="3" fill="#fff2bd" /></>)}
        {frame("b", <><rect x="6" y="2" width="3" height="3" fill="#ffe3a1" /><rect x="5" y="5" width="6" height="3" fill="currentColor" /><rect x="3" y="8" width="9" height="4" fill="currentColor" /><rect x="5" y="12" width="6" height="2" fill="#ff6d6d" /><rect x="8" y="6" width="2" height="3" fill="#fff2bd" /></>)}
        {frame("c", <><rect x="8" y="1" width="2" height="4" fill="#ffe3a1" /><rect x="5" y="4" width="6" height="4" fill="currentColor" /><rect x="4" y="8" width="8" height="4" fill="currentColor" /><rect x="6" y="12" width="4" height="2" fill="#ff6d6d" /><rect x="6" y="6" width="2" height="3" fill="#fff2bd" /></>)}
      </svg>
    );
  }

  if (element === "water") {
    return (
      <svg className="element-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        {frame("a", <><rect x="7" y="1" width="2" height="2" fill="#d9f4ff" /><rect x="6" y="3" width="4" height="3" fill="currentColor" /><rect x="5" y="6" width="6" height="4" fill="currentColor" /><rect x="4" y="10" width="8" height="2" fill="currentColor" /><rect x="6" y="13" width="4" height="1" fill="#d9f4ff" /><rect x="3" y="14" width="3" height="1" fill="#6fa8ff" /><rect x="10" y="14" width="3" height="1" fill="#6fa8ff" /></>)}
        {frame("b", <><rect x="8" y="1" width="2" height="3" fill="#d9f4ff" /><rect x="6" y="4" width="5" height="3" fill="currentColor" /><rect x="5" y="7" width="6" height="4" fill="currentColor" /><rect x="4" y="11" width="8" height="2" fill="currentColor" /><rect x="2" y="14" width="4" height="1" fill="#6fa8ff" /><rect x="9" y="14" width="4" height="1" fill="#d9f4ff" /></>)}
        {frame("c", <><rect x="6" y="2" width="2" height="2" fill="#d9f4ff" /><rect x="5" y="4" width="5" height="3" fill="currentColor" /><rect x="4" y="7" width="7" height="4" fill="currentColor" /><rect x="5" y="11" width="6" height="2" fill="currentColor" /><rect x="3" y="14" width="3" height="1" fill="#d9f4ff" /><rect x="10" y="14" width="3" height="1" fill="#6fa8ff" /></>)}
      </svg>
    );
  }

  if (element === "wind") {
    return (
      <svg className="element-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        {frame("a", <><rect x="2" y="4" width="8" height="2" fill="currentColor" /><rect x="4" y="7" width="9" height="2" fill="#d9fbff" /><rect x="2" y="10" width="6" height="2" fill="currentColor" /><rect x="11" y="3" width="3" height="2" fill="#86e8ff" /><rect x="13" y="10" width="2" height="2" fill="#86e8ff" /></>)}
        {frame("b", <><rect x="3" y="3" width="8" height="2" fill="currentColor" /><rect x="2" y="7" width="10" height="2" fill="#d9fbff" /><rect x="5" y="11" width="7" height="2" fill="currentColor" /><rect x="12" y="4" width="2" height="2" fill="#86e8ff" /><rect x="1" y="10" width="2" height="2" fill="#86e8ff" /></>)}
        {frame("c", <><rect x="2" y="5" width="10" height="2" fill="currentColor" /><rect x="4" y="8" width="8" height="2" fill="#d9fbff" /><rect x="2" y="11" width="8" height="2" fill="currentColor" /><rect x="13" y="4" width="2" height="2" fill="#86e8ff" /><rect x="11" y="11" width="3" height="2" fill="#86e8ff" /></>)}
      </svg>
    );
  }

  return (
    <svg className="element-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {frame("a", <><rect x="3" y="9" width="10" height="4" fill="currentColor" /><rect x="5" y="6" width="2" height="3" fill="#ffe3a1" /><rect x="8" y="4" width="3" height="5" fill="#d2c27e" /><rect x="9" y="3" width="1" height="1" fill="#fff2bd" /><rect x="2" y="13" width="12" height="2" fill="#7b6d42" /></>)}
      {frame("b", <><rect x="2" y="9" width="11" height="4" fill="currentColor" /><rect x="4" y="7" width="2" height="2" fill="#ffe3a1" /><rect x="8" y="3" width="3" height="6" fill="#d2c27e" /><rect x="10" y="2" width="1" height="1" fill="#fff2bd" /><rect x="3" y="13" width="11" height="2" fill="#7b6d42" /></>)}
      {frame("c", <><rect x="3" y="8" width="10" height="5" fill="currentColor" /><rect x="5" y="5" width="2" height="3" fill="#ffe3a1" /><rect x="9" y="4" width="2" height="4" fill="#d2c27e" /><rect x="6" y="4" width="1" height="1" fill="#fff2bd" /><rect x="2" y="13" width="12" height="2" fill="#7b6d42" /></>)}
    </svg>
  );
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
      <div className="boss-slot__header"><span className="eyebrow">WYVERN BOSS</span><span className="boss-slot__element">{element.toUpperCase()} SLOT</span></div>
      <div className="boss-portrait">
        {boss.image ? <img src={boss.image} alt={boss.alt} /> : <div className="boss-portrait__empty"><span className="boss-portrait__glyph">?</span><span>PORTRAIT SLOT</span></div>}
      </div>
      <p className="boss-name">{boss.name}</p>
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
  const boss = current ? BOSS_SLOTS[current] : null;

  return (
    <PixelPanel className="mb-5 animate-rise">
      <PixelHeader icon={<WyvernCrest />} title="WYVERN TRACE" right={<span className="text-[8px] text-dv-bg/70 tracking-wider">RAID SIGNAL</span>} />
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] text-dv-brassLight">What element is the guild hunting?</p>
          <p className="text-[8px] text-slate-300/55 mt-1">Broadcast the current trace so everyone is synced.</p>
        </div>
        {current && <span className="status-chip shrink-0">SYNCED</span>}
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
              onClick={async () => {
                setBursting(el.key);
                setPending(el.key);
                try {
                  await onSelect(el.key);
                } finally {
                  setPending(null);
                  window.setTimeout(() => setBursting((value) => value === el.key ? null : value), 900);
                }
              }}
              className={["element-choice", "element-choice--" + el.key, active ? "is-active" : "", isBursting ? "is-bursting" : "", pending === el.key ? "is-pending" : ""].join(" ")}
            >
              <span className="element-orb"><PixelElementArt element={el.key} /></span>
              <span className="element-label">{el.label}</span>
              <span className="element-state">{active ? "TRACE SET" : el.hint.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {current && boss && <BossPortrait element={current} boss={boss} />}

      {current && <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 text-[9px] text-dv-brassLight flex items-start gap-2"><span className="text-dv-violet">◆</span><span>{current.toUpperCase()} trace locked for this raid{setBy ? " · set by " + setBy : ""}.</span></div>}
    </PixelPanel>
  );
}
