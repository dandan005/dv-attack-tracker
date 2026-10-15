"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getCycleInfo } from "@/lib/cycle";
import { PixelPanel } from "./PixelPanel";

function AttackGlyph({ done, urgent }: { done: boolean; urgent: boolean }) {
  if (done) {
    return (
      <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M8 1 13 3v4c0 4-2.2 6.4-5 8-2.8-1.6-5-4-5-8V3l5-2Z" fill="currentColor" />
        <rect x="4" y="7" width="2" height="2" fill="#11172b" /><rect x="6" y="9" width="2" height="2" fill="#11172b" />
        <rect x="8" y="7" width="2" height="2" fill="#11172b" /><rect x="10" y="5" width="2" height="2" fill="#11172b" />
      </svg>
    );
  }

  if (urgent) {
    return (
      <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M8 1 15 14H1L8 1Z" fill="currentColor" />
        <rect x="7" y="5" width="2" height="5" fill="#11172b" /><rect x="7" y="11" width="2" height="2" fill="#11172b" />
      </svg>
    );
  }

  return (
    <svg className="attack-pixel-art" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 2h2v2h2v2h2v2h2v2h2v2h2v2h-3v-2H9v-2H7V8H5V6H3V4H2V2Z" fill="currentColor" />
      <path d="M14 2h-2v2h-2v2H8v2H6v2H4v2H2v2h3v-2h2v-2h2V8h2V6h2V4h1V2Z" fill="currentColor" />
    </svg>
  );
}

// ADD THIS — new helper function, sits at top level, outside any component
async function logWithRetry(fn: () => Promise<void>, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

export function LogAttackButton({
  loggedDays,
  onLog,
  loggedAt = {},
  element = null,
  checkedIn = 0,
  total = 0,
}: {
  loggedDays: number[];
  loggedAt?: Record<number, string>;
  element?: string | null;
  checkedIn?: number;
  total?: number;
  onLog: (day: number, cycleStartISO: string) => Promise<void>;
}) {
  const [ms, setMs] = useState<number>(0);
  const [dayNumber, setDayNumber] = useState<number>(() => getCycleInfo().dayNumber);
  const [cycleStartISO, setCycleStartISO] = useState<string>(() => getCycleInfo().cycleStartISO);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const tick = () => {
      const info = getCycleInfo();
      setMs(info.msUntilReset);
      setDayNumber(info.dayNumber);
      setCycleStartISO(info.cycleStartISO);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const done = loggedDays.includes(dayNumber);
  const urgent = !done && ms > 0 && ms < 60 * 60 * 1000;
  const sealed = done && loggedAt[dayNumber] ? new Date(loggedAt[dayNumber]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const phaseLabel = dayNumber >= 4 && dayNumber <= 6 ? "WYVERN PHASE" + (element ? " · " + element.toUpperCase() : "") : dayNumber <= 3 ? "EXPLORATION PHASE" : "STANDBY";

  async function handleClick() {
    if (done || pending) return;
    setPending(true);
    try {
      const info = getCycleInfo();
      setDayNumber(info.dayNumber);
      setCycleStartISO(info.cycleStartISO);
      await logWithRetry(() => onLog(info.dayNumber, info.cycleStartISO));
    } catch (err) {
      console.error("Failed to log attack after retries:", err);
      alert("Couldn't log your attack after several tries — check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PixelPanel className="animate-rise p-0 overflow-hidden">
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">YOUR RAID LOG</p>
          <p className="text-[9px] text-slate-300/55">{done ? "NEXT ATTACK IN" : "RESET IN"}</p>
        </div>
        <div className="flex items-end justify-between gap-3 mt-2">
          <div>
            <h2 className="text-sm text-dv-brassLight">DAY {dayNumber} ATTACK</h2>
            <p className="text-[9px] text-slate-300/70 mt-1">{phaseLabel}</p>
          </div>
          <p className={urgent ? "text-sm text-dv-ember animate-blink" : "text-sm text-dv-emerald"}>{formatCountdown(ms)}</p>
        </div>
        <div className="grid grid-cols-6 gap-1 mt-4">
          {[1, 2, 3, 4, 5, 6].map((day) => {
            const logged = loggedDays.includes(day);
            const today = day === dayNumber;
            const missed = !logged && day < dayNumber;
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={["h-1.5 w-full rounded-full", logged ? "bg-dv-emerald" : missed ? "bg-dv-ember/50" : today ? "bg-dv-brass" : "bg-dv-panel2"].join(" ")} />
                <span className={["flex items-center gap-0.5 text-[9px] px-1 border", today ? "border-dv-brass text-dv-brassLight" : "border-transparent", !today && logged ? "text-dv-emerald" : "", !today && missed ? "text-dv-ember/70" : "", !today && !logged && !missed ? "text-slate-300/50" : ""].join(" ")}>
                  {logged && <svg viewBox="0 0 8 8" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4l2 2 4-4" /></svg>}
                  D{day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-1 mt-3 text-center text-[10px] text-slate-300/80">
          <span>{loggedDays.length}/6 RECORDED{sealed ? " · SEALED " + sealed : ""}</span>
          {total > 0 && <span>{checkedIn} OF {total} CHECKED IN TODAY</span>}
        </div>
      </div>

      <button onClick={handleClick} disabled={done || pending} aria-label={done ? "Attack logged" : "Log today's attack"} className={["attack-action", done ? "is-done" : urgent ? "is-urgent" : "", pending ? "is-pending" : ""].join(" ")}>
        <span className="attack-sigil"><AttackGlyph done={done} urgent={urgent} /></span>
        <span className="attack-copy">{done ? "ATTACK SEALED" : pending ? "LOGGING..." : "LOG TODAY'S ATTACK"}<small>{done ? "RAID ENTRY CONFIRMED" : urgent ? "RESET WINDOW CLOSING" : "ADD YOUR RUN TO THE GUILD LEDGER"}</small></span>
      </button>
    </PixelPanel>
  );
}
