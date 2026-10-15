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
  const edge = "1px 0 #2a1608, -1px 0 #2a1608, 0 1px #2a1608, 0 -1px #2a1608";

  return (
    <div className="flex items-center justify-center gap-2" style={{ marginTop: 8 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <circle cx="8" cy="8" r="7.2" fill="#c0392b" stroke="#5a1414" strokeWidth="1" />
        <circle cx="8" cy="8" r="5.2" fill="#f4ecd8" stroke="#5a1414" strokeWidth="0.8" />
        <rect x="7.3" y="3.6" width="1.4" height="1.2" fill="#5a1414" />
        <rect x="11.2" y="7.3" width="1.2" height="1.4" fill="#5a1414" />
        <rect x="7.3" y="11.2" width="1.4" height="1.2" fill="#5a1414" />
        <rect x="3.6" y="7.3" width="1.2" height="1.4" fill="#5a1414" />
        <g style={{ transform: "rotate(" + step * 90 + "deg)", transformOrigin: "8px 8px" }}>
          <rect x="7.3" y="4.8" width="1.4" height="3.6" fill="#2a1608" />
        </g>
        <rect x="7" y="7" width="2" height="2" fill="#2a1608" />
      </svg>
      <span style={{ fontSize: 9, letterSpacing: "0.06em", color: "#ffffff", textShadow: edge }}>
        {ms === null ? "--d --h --m" : d + "d " + h + "h " + m + "m"}
      </span>
    </div>
  );
}
