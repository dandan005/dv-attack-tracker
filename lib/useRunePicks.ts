"use client";
import { useCallback, useEffect, useState } from "react";

export type RunePick = { member_id: string; username: string; day_number: number; rune_name: string };

// Loads this cycle's rune picks for the caller's guild. Failures leave picks empty and still mark loaded,
// so a broken request never blocks the Ledger.
export function useRunePicks() {
  const [meId, setMeId] = useState<string | null>(null);
  const [today, setToday] = useState<number>(0);
  const [picks, setPicks] = useState<RunePick[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/rune-picks", { cache: "no-store" });
      const d = await res.json();
      if (res.ok) {
        setMeId(d.meId ?? null);
        setToday(d.today ?? 0);
        setPicks(Array.isArray(d.picks) ? d.picks : []);
      }
    } catch {
      /* keep previous picks */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { meId, today, picks, loaded, reload };
}
