import { PixelPanel, PixelHeader } from "./PixelPanel";
import DvMapScene from "./DvMapScene";

const MAP_LABELS: Record<string, string> = { wasteland: "WASTELAND PLATEAU", lava: "LAVA MOUNTAINS", icevale: "ICE VALE", windcliff: "WIND CLIFF" };

function CompassGlyph() {
  return (
    <svg className="wyvern-crest" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M8 1 10 6l5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" />
      <path d="m8 5 1 3-1 3-1-3 1-3Z" fill="#fff2bd" />
    </svg>
  );
}

export function ExplorationPhase({ currentDay, guildId, meId, rankMembers }: { currentDay: number; guildId?: number | null; meId?: string | null; rankMembers: any[] }) {
  // rankMembers is every member from the dashboard's startup fetch, so no extra request is needed here.
  const loaded = rankMembers.length > 0;
  const rows = rankMembers.filter((m) => m.guild_id === guildId);
  const mine = meId ? rankMembers.find((m) => m.id === meId) : undefined;
  const myMap: string | null = mine?.dv_map && MAP_LABELS[mine.dv_map] ? mine.dv_map : null;

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
        <span className="status-chip shrink-0">DAY {currentDay}/3</span>
      </div>

      {!loaded && (
        <p className="mb-3 text-[9px] text-slate-300/60 tracking-wider">LOADING YOUR MAP...</p>
      )}
      {myMap && (
        <div className="mb-3">
          <p className="eyebrow mb-2">YOUR ASSIGNED MAP</p>
          <DvMapScene k={myMap} label={MAP_LABELS[myMap]} members={rows.filter((m) => m.dv_map === myMap)} onPick={() => {}} />
        </div>
      )}

      <p className="text-[10px] text-slate-200/60 mt-3 tracking-wide">EXPLORE • COOK SPECIAL DISHES • BUILD RAID ADVANTAGE</p>
    </PixelPanel>
  );
}
