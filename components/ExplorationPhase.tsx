"use client";
import { useEffect, useState } from "react";
import DvMapScene from "./DvMapScene";
import { RunePicker } from "./RunePicker";
import { PlayerInfoModal } from "./PlayerInfoModal";
import { RuneBag } from "./RuneBag";
import { useRunePicks } from "@/lib/useRunePicks";
import { getCycleInfo } from "@/lib/cycle";

const MAP_LABELS: Record<string, string> = { wasteland: "WASTELAND PLATEAU", lava: "LAVA MOUNTAINS", icevale: "ICE VALE", windcliff: "WIND CLIFF" };

function dismissKey(day: number) {
  return `dv-rune-dismissed:${getCycleInfo().cycleStartISO}:${day}`;
}

export function ExplorationPhase({ currentDay, guildId, meId, rankMembers }: { currentDay: number; guildId?: number | null; meId?: string | null; rankMembers: any[] }) {
  // rankMembers is every member from the dashboard's startup fetch, so no extra request is needed here.
  const loaded = rankMembers.length > 0;
  const rows = rankMembers.filter((m) => m.guild_id === guildId);
  const mine = meId ? rankMembers.find((m) => m.id === meId) : undefined;
  const myMap: string | null = mine?.dv_map && MAP_LABELS[mine.dv_map] ? mine.dv_map : null;

  const { meId: apiMeId, picks, loaded: picksLoaded, reload } = useRunePicks();
  const myId = meId ?? apiMeId;
  const myPick = picks.find((p) => p.day_number === currentDay && p.member_id === myId)?.rune_name ?? null;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Open the rune picker at the start of an exploration day, once per session if dismissed.
  useEffect(() => {
    if (!picksLoaded || currentDay > 3 || myPick) return;
    try {
      if (sessionStorage.getItem(dismissKey(currentDay))) return;
    } catch {
      /* ignore */
    }
    setPickerOpen(true);
    // Runs once per day once picks are known; myPick is read from that same snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picksLoaded, currentDay]);

  function closePicker() {
    setPickerOpen(false);
    try { sessionStorage.setItem(dismissKey(currentDay), "1"); } catch { /* ignore */ }
  }

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

      {currentDay <= 3 && (
        <div className="item-slot mt-4 flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="eyebrow">DAY {currentDay} RUNE</p>
            <p className="mt-1 truncate text-[10px] text-slate-200/80">{myPick ?? "Not picked yet"}</p>
          </div>
          <button type="button" onClick={() => setPickerOpen(true)} className="item-slot shrink-0 px-3 py-2 text-[9px]">
            {myPick ? "CHANGE" : "PICK RUNE"}
          </button>
        </div>
      )}

      {!loaded && (
        <p className="mt-4 text-[9px] uppercase tracking-[.1em] text-slate-300/50 animate-blink">Loading your map...</p>
      )}
      {myMap && (
        <div className="mt-4">
          <p className="eyebrow mb-2">YOUR ASSIGNED MAP</p>
          <div className="relative">
            <DvMapScene k={myMap} label={MAP_LABELS[myMap]} members={rows.filter((m) => m.dv_map === myMap)} onPick={(m) => setSelected(m)} />
            <RuneBag inMap />
          </div>
        </div>
      )}

      <p className="mt-4 text-[10px] uppercase tracking-[.1em] text-slate-300/50">Explore · Cook special dishes · Build raid advantage</p>

      {pickerOpen && currentDay <= 3 && (
        <RunePicker day={currentDay} picks={picks} meId={myId} onClose={closePicker} onSaved={reload} />
      )}
      {selected && (
        <PlayerInfoModal member={selected} picks={picks.filter((p) => p.member_id === selected.id)} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
