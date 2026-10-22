import DvMapScene from "./DvMapScene";

const MAP_LABELS: Record<string, string> = { wasteland: "WASTELAND PLATEAU", lava: "LAVA MOUNTAINS", icevale: "ICE VALE", windcliff: "WIND CLIFF" };

export function ExplorationPhase({ currentDay, guildId, meId, rankMembers }: { currentDay: number; guildId?: number | null; meId?: string | null; rankMembers: any[] }) {
  // rankMembers is every member from the dashboard's startup fetch, so no extra request is needed here.
  const loaded = rankMembers.length > 0;
  const rows = rankMembers.filter((m) => m.guild_id === guildId);
  const mine = meId ? rankMembers.find((m) => m.id === meId) : undefined;
  const myMap: string | null = mine?.dv_map && MAP_LABELS[mine.dv_map] ? mine.dv_map : null;

  return (
    <section className="pixel-border bg-dv-panel/95 shadow-pixel mb-5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">EXPLORATION // TRACE HUNT</p>
          <h2 className="mt-2 text-lg text-dv-brassLight">Search the region.</h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200/65">
            Cooking helps the raid phase. Exploration earns materials, points and trace chances. Days 1 to 3, 3 entries a day.
          </p>
        </div>
        <span className="status-chip shrink-0">DAY {currentDay}/3</span>
      </div>

      {!loaded && (
        <p className="mt-4 text-[9px] uppercase tracking-[.1em] text-slate-300/50 animate-blink">Loading your map...</p>
      )}
      {myMap && (
        <div className="mt-4">
          <p className="eyebrow mb-2">YOUR ASSIGNED MAP</p>
          <DvMapScene k={myMap} label={MAP_LABELS[myMap]} members={rows.filter((m) => m.dv_map === myMap)} onPick={() => {}} />
        </div>
      )}

      <p className="mt-4 text-[10px] uppercase tracking-[.1em] text-slate-300/50">Explore · Cook special dishes · Build raid advantage</p>
    </section>
  );
}
