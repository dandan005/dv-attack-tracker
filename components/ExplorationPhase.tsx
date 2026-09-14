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
        right={<span className="text-[10px] text-dv-bg/85 tracking-wider">3 ENTRIES / DAY</span>}
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow">TRACE HUNT // DAY {currentDay}</p>
          <p className="text-[12px] leading-relaxed text-dv-brassLight mt-1">Search the region and prepare the raid.</p>
          <p className="text-[11px] leading-relaxed text-slate-200/75 mt-1">Cooking helps the raid phase; exploration earns materials, points, and trace chances.</p>
        </div>
        <span className="status-chip shrink-0">DAY {currentDay}/2</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[1, 2, 3].map((entry) => (
          <div key={entry} className="pixel-frame border border-dv-line bg-dv-bg/70 px-2 py-3 text-center">
            <span className="block text-dv-violet text-[12px]">◆</span>
            <span className="block text-[10px] text-dv-brassLight mt-1">ENTRY {entry}</span>
            <span className="block text-[10px] text-slate-200/65 mt-1">AVAILABLE</span>
          </div>
        ))}
      </div>

      <div className="pixel-frame border border-dv-line bg-dv-panel2 px-3 py-3 mb-3">
        <p className="text-[10px] text-dv-emerald tracking-wide mb-2">EACH ENTRY REWARDS</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="block text-[11px] text-dv-brassLight">Materials</span>
            <span className="block text-[9px] text-slate-200/60 mt-0.5">varies by zone</span>
          </div>
          <div>
            <span className="block text-[11px] text-dv-brassLight">Points</span>
            <span className="block text-[9px] text-slate-200/60 mt-0.5">leaderboard rank</span>
          </div>
          <div>
            <span className="block text-[11px] text-dv-brassLight">Bar Fill</span>
            <span className="block text-[9px] text-slate-200/60 mt-0.5">raises trace odds</span>
          </div>
        </div>
      </div>

      <div className="pixel-frame border border-dv-violet/60 bg-dv-panel2 px-3 py-3 flex items-start gap-2 mb-3">
        <span className="text-dv-violet">◆</span>
        <div>
          <p className="text-[11px] text-dv-brassLight">WYVERN INTEL HIDDEN</p>
          <p className="text-[11px] leading-relaxed text-slate-200/75 mt-1">Fill the exploration progress bar and watch for traces. Wyvern tracking unlocks on Day 3 when a Wyvern is recorded.</p>
        </div>
      </div>

      <div className="pixel-frame border border-dv-brass/60 bg-dv-panel2 px-3 py-3 flex items-start gap-2">
        <span className="text-dv-brass">◆</span>
        <div>
          <p className="text-[11px] text-dv-brassLight">TRACE BOUNTY</p>
          <p className="text-[11px] leading-relaxed text-slate-200/75 mt-1">The Wyvern's region and its trace spots are shared across the whole league — every guild is searching the same map. That region holds 3 traces to find; every other region holds 1. Whoever finds one earns a flat +10,000 points.</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-200/60 mt-3 tracking-wide">EXPLORE • COOK SPECIAL DISHES • BUILD RAID ADVANTAGE</p>
    </PixelPanel>
  );
}
