"use client";

import { useState } from "react";
import { RaidClock } from "./RaidClock";
import { PixelPanel } from "./PixelPanel";

type Element = "wind" | "fire" | "earth" | "water";

const ELEMENTS: { key: Element; label: string; hint: string }[] = [
  { key: "wind", label: "WIND", hint: "swift" },
  { key: "fire", label: "FIRE", hint: "fierce" },
  { key: "earth", label: "EARTH", hint: "steady" },
  { key: "water", label: "WATER", hint: "deep" },
];

type BossSlot = { name: string; image: string; alt: string; location: string };
function BossPortrait({ element, boss }: { element: Element; boss: BossSlot }) {
  return (
    <div className={"boss-slot boss-slot--" + element}>
      <div className="boss-slot__header" style={{ justifyContent: "center" }}>
        <div className="boss-name-row">
          <span className={"element-badge element-badge--" + element}>
            <span className="element-orb element-orb--sm"><PixelElementArt element={element} /></span>
          </span>
          <p className="boss-name">{boss.name}</p>
        </div>
      </div>
      <div className="mb-2 bg-black/70 px-3 py-2 text-center text-[10px] tracking-widest text-dv-brassLight">
        DRAGON VALLEY: {boss.location}
        <p className="mt-1 text-[9px] normal-case tracking-normal text-slate-200/70">A valley where dragons have lived since long ago.</p>
      </div>
      <div className="boss-portrait" style={{ backgroundImage: "url(/bosses/" + element + ".svg)", backgroundSize: "cover", backgroundPosition: "center" }}>
        {boss.image ? (
          <img src={boss.image} alt={boss.alt} className="block h-auto w-full object-cover" />
        ) : (
          <div className="boss-portrait__empty"><span className="boss-portrait__glyph">?</span><span>PORTRAIT SLOT</span></div>
        )}
      </div>
      <RaidClock />
    </div>
  );
}

const BOSS_SLOTS: Record<Element, BossSlot> = {
  wind: { name: "Voltaris", image: "/bosses/water-dragon.png", alt: "Voltaris pixel dragon portrait", location: "WIND CLIFF" },
  fire: { name: "Pyros", image: "/bosses/fire-dragon.png", alt: "Pyros pixel dragon portrait", location: "LAVA MOUNTAINS" },
  earth: { name: "Bardoran", image: "/bosses/earth-dragon.png", alt: "Bardoran pixel dragon portrait", location: "WASTELAND PLATEAU" },
  water: { name: "Glacion", image: "/bosses/wind-dragon.png", alt: "Glacion pixel dragon portrait", location: "ICE VALE" },
};

export const WYVERN_LOCATION: Record<string, string> = {
  wind: "WIND CLIFF",
  fire: "LAVA MOUNTAINS",
  earth: "WASTELAND PLATEAU",
  water: "ICE VALE",
};

function PixelElementArt({ element }: { element: Element }) {
  return <img className="element-pixel-art" src={"/elements/" + element + ".png"} alt="" draggable={false} />;
}


export function WyvernTracker({
  current,
  setBy,
  onSelect,
  isAdmin = false,
}: {
  current: Element | null;
  setBy: string | null;
  onSelect: (el: Element) => Promise<void>;
  /** Only admins/officers may set or change the trace. Everyone else gets a read-only view. */
  isAdmin?: boolean;
}) {
  const [pending, setPending] = useState<Element | null>(null);
  const [bursting, setBursting] = useState<Element | null>(null);
  const [changing, setChanging] = useState(false);

  const boss = current ? BOSS_SLOTS[current] : null;
  // Everyone sees the picker; only admins can actually interact with it.
  const showPicker = !current || changing;

  async function handleSelect(el: Element) {
    if (!isAdmin) return;
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
    <PixelPanel className="animate-rise pb-5">
      {showPicker && (
        <>
          <div className="mb-4">
            <p className="text-lg text-dv-brassLight">What element is the guild hunting?</p>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200/60">Broadcast the current trace so everyone is synced.</p>
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
                  aria-disabled={!isAdmin}
                  disabled={pending !== null || !isAdmin}
                  onClick={() => handleSelect(el.key)}
                  className={["element-choice", "element-choice--" + el.key, active ? "is-active" : "", isBursting ? "is-bursting" : "", pending === el.key ? "is-pending" : "", !isAdmin ? "is-readonly" : ""].join(" ")}
                >
                  <span className="element-orb"><PixelElementArt element={el.key} /></span>
                  <span className="element-label">{el.label}</span>
                  <span className="element-state">{active ? "TRACE SET" : el.hint.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {changing && (
            <button type="button" onClick={() => setChanging(false)} className="pixel-border w-full bg-dv-panel2 px-3 py-2 text-xs text-slate-200/70">
              Cancel
            </button>
          )}
        </>
      )}

      {!showPicker && current && boss && (
        <>
          <BossPortrait element={current} boss={boss} />
        </>
      )}

      {current && !changing && (
        <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 mt-1 text-[10px] text-dv-brassLight flex items-start justify-between gap-2">
          <span className="flex items-start gap-2">
            <span className="text-dv-violet">◆</span>
            <span>{current.toUpperCase()} trace locked for this raid{setBy ? " · set by " + setBy : ""}.</span>
          </span>
          <button
            type="button"
            onClick={() => isAdmin && setChanging(true)}
            disabled={!isAdmin}
            aria-disabled={!isAdmin}
            className={"underline underline-offset-2 shrink-0 " + (isAdmin ? "text-dv-violet" : "text-slate-300/40 cursor-not-allowed")}
          >
            Change
          </button>
        </div>
      )}
    </PixelPanel>
  );
}
