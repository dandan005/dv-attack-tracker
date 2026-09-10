import { PixelPanel, PixelHeader } from "./PixelPanel";

function CompassGlyph() {
  return (
    <svg className="wyvern-crest" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M8 1 10 6l5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" />
      <path d="m8 5 1 3-1 3-1-3 1-3Z" fill="#fff2bd" />
    </svg>
  );
}

export function ExplorationPhase({ currentDay }: { currentDay: number }) {
  return (
    <PixelPanel className="mb-5 animate-rise">
      <PixelHeader
        icon={<CompassGlyph />}
        title="EXPLORATION PHASE"
        right={<span className="text-[8px] text-dv-bg/70 tracking-wider">3 ENTRIES / DAY</span>}
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow">TRACE HUNT // DAY {currentDay}</p>
          <p className="text-[10px] text-dv-brassLight mt-1">Search the region and prepare the raid.</p>
          <p className="text-[8px] text-slate-300/55 mt-1">Cooking helps the raid phase; exploration earns materials, points, and trace chances.</p>
        </div>
        <span className="status-chip shrink-0">DAY {currentDay}/2</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[1, 2, 3].map((entry) => (
          <div key={entry} className="pixel-frame border border-dv-line bg-dv-bg/70 px-2 py-3 text-center">
            <span className="block text-dv-violet text-[11px]">◆</span>
            <span className="block text-[8px] text-dv-brassLight mt-1">ENTRY {entry}</span>
            <span className="block text-[7px] text-slate-300/45 mt-1">AVAILABLE</span>
          </div>
        ))}
      </div>

      <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 flex items-start gap-2">
        <span className="text-dv-violet">◆</span>
        <div>
          <p className="text-[9px] text-dv-brassLight">WYVERN INTEL HIDDEN</p>
          <p className="text-[8px] text-slate-300/55 mt-1">Fill the exploration progress bar and watch for traces. Wyvern tracking unlocks on Day 3 when a Wyvern is recorded.</p>
        </div>
      </div>

      <p className="text-[7px] text-slate-300/40 mt-3">EXPLORE • COOK SPECIAL DISHES • BUILD RAID ADVANTAGE</p>
    </PixelPanel>
  );
}
