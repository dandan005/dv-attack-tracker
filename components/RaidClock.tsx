"use client";

import { useEffect, useState } from "react";
import { getCycleInfo } from "../lib/cycle";

const DAY_MS = 24 * 60 * 60 * 1000;

function msUntilRaidEnd() {
  const { cycleStartISO } = getCycleInfo();
  const end = Date.parse(cycleStartISO + "T14:00:00Z") + 6 * DAY_MS;
  return Math.max(0, end - Date.now());
}

export function RaidClock() {
  const [ms, setMs] = useState<number | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMs(msUntilRaidEnd());
    const id = setInterval(() => {
      setMs(msUntilRaidEnd());
      setStep((s) => (s + 1) % 4);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.floor((ms ?? 0) / 60000);
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;

  return (
    <div className="flex items-center justify-center gap-2" style={{ marginTop: 10 }}>
      <svg width="22" height="22" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="#1b2442" stroke="#c98a3e" strokeWidth="1.5" />
        <rect x="7.25" y="2" width="1.5" height="1.5" fill="#c98a3e" />
        <rect x="12.5" y="7.25" width="1.5" height="1.5" fill="#c98a3e" />
        <rect x="7.25" y="12.5" width="1.5" height="1.5" fill="#c98a3e" />
        <rect x="2" y="7.25" width="1.5" height="1.5" fill="#c98a3e" />
        <g style={{ transform: "rotate(" + step * 90 + "deg)", transformOrigin: "8px 8px" }}>
          <rect x="7.25" y="3.5" width="1.5" height="4.75" fill="#ffe3a1" />
        </g>
        <rect x="7" y="7" width="2" height="2" fill="#ff6d6d" />
      </svg>
      <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "#2e1f10" }}>
        {ms === null ? "--d --h --m" : d + "d " + h + "h " + m + "m"}
      </span>
    </div>
  );
}
