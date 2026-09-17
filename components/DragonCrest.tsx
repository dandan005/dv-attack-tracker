"use client";

import { useState } from "react";

export function DragonCrest({ size = 32 }: { size?: number }) {
  const circleSize = size * 1.4;
  const glyphs = ["ᛏ", "ᚨ", "ᛒ", "ᚱ", "ᛉ", "ᛃ", "ᚦ", "ᛗ"];
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const softId = `crest-blur-glow-soft-${uid}`;
  const tightId = `crest-blur-glow-tight-${uid}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Magic circle overlay — centered via translate, not inset+auto-margin
          (inset-0 + m-auto breaks once the child is bigger than the parent) */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: circleSize, height: circleSize, opacity: 0.5 }}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle className="magic-circle-outer" cx="50" cy="50" r="46" fill="none" stroke="#8b7dff" strokeWidth="0.6" strokeDasharray="2 3" style={{ transformOrigin: "50px 50px" }} />
        <circle className="magic-circle-inner" cx="50" cy="50" r="38" fill="none" stroke="#ffe3a1" strokeWidth="0.5" strokeDasharray="1 2" style={{ transformOrigin: "50px 50px" }} />
        <g className="magic-circle-outer" style={{ transformOrigin: "50px 50px" }}>
          <polygon points="50,12 85,70 15,70" fill="none" stroke="#8b7dff" strokeWidth="0.5" opacity="0.7" />
          <polygon points="50,88 15,30 85,30" fill="none" stroke="#8b7dff" strokeWidth="0.5" opacity="0.4" />
        </g>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          const x = 50 + 42 * Math.cos((angle * Math.PI) / 180);
          const y = 50 + 42 * Math.sin((angle * Math.PI) / 180);
          return <circle key={i} className="magic-circle-inner" cx={x} cy={y} r="1" fill="#ffe3a1" style={{ transformOrigin: "50px 50px" }} />;
        })}
      </svg>

      {/* Runic glyph ring — outer wrapper handles centering (static transform),
          inner wrapper handles the spin (animated transform). Two separate
          elements because one element can't carry both a translate-centering
          transform and a rotate-animation transform at once — the keyframes
          would just overwrite the translate. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: circleSize, height: circleSize }}
      >
        <div className="crest-rune-ring w-full h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            {glyphs.map((glyph, i) => {
              const angle = (i * 360) / glyphs.length;
              const x = 50 + 44 * Math.cos((angle * Math.PI) / 180);
              const y = 50 + 44 * Math.sin((angle * Math.PI) / 180);
              return (
                <text key={i} x={x} y={y} fill="#ffe3a1" fontSize="7" textAnchor="middle" dominantBaseline="middle" opacity="0.8" style={{ filter: "drop-shadow(0 0 2px rgba(255, 227, 161, 0.9))" }}>
                  {glyph}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <span className="rune-sparkle" style={{ top: "5%", left: "10%", animationDelay: "0s" }} />
      <span className="rune-sparkle--sm rune-sparkle" style={{ top: "15%", left: "75%", animationDelay: "0.5s" }} />
      <span className="rune-sparkle" style={{ top: "60%", left: "5%", animationDelay: "1.0s" }} />
      <span className="rune-sparkle--sm rune-sparkle" style={{ top: "70%", left: "85%", animationDelay: "1.4s" }} />
      <span className="rune-sparkle" style={{ top: "85%", left: "45%", animationDelay: "0.3s" }} />
      <span className="rune-sparkle--sm rune-sparkle" style={{ top: "40%", left: "90%", animationDelay: "0.8s" }} />

      {/* Shield badge — this one was fine, it's sized exactly to the container */}
      <span className="absolute inset-0 m-auto flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="crest-glow relative"
          width={size}
          height={size}
          viewBox="0 0 32 32"
          role="img"
          aria-label="Dragon Valley Attack Ledger guild mark"
        >
          <defs>
            <filter id={softId} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blurred" />
              <feColorMatrix in="blurred" type="matrix" values="0 0 0 0 1  0 0 0 0 0.83  0 0 0 0 0.4  0 0 0 1.4 0" />
            </filter>
            <filter id={tightId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blurred" />
              <feColorMatrix in="blurred" type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.55  0 0 0 1.6 0" />
            </filter>
          </defs>

          <g filter={`url(#${softId})`} className="crest-glow-pulse-wide">
            <path d="M6 5h20v13l-2 5-8 5-8-5-2-5V5Z" fill="#ffe3a1" />
          </g>
          <g filter={`url(#${tightId})`} className="crest-glow-pulse-tight">
            <path d="M6 5h20v13l-2 5-8 5-8-5-2-5V5Z" fill="#fff4d6" />
          </g>

          <g shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
            <path d="M6 5h20v13l-2 5-8 5-8-5-2-5V5Z" fill="#0c0f22" />
            <path d="M6 5h20v13l-2 5-8 5-8-5-2-5V5Z" fill="none" stroke="#8b7dff" strokeWidth="1" opacity="1" />
            <path d="M8 7h16v10l-2 4-6 4-6-4-2-4V7Z" fill="none" stroke="#ffe3a1" strokeWidth="0.8" opacity="0.9" />
            <rect x="5.5" y="9" width="1.5" height="3" fill="#8b7dff" />
            <rect x="25" y="9" width="1.5" height="3" fill="#8b7dff" />
            <rect x="9" y="21.5" width="3" height="1.2" fill="#ffe3a1" />
            <rect x="20" y="21.5" width="3" height="1.2" fill="#ffe3a1" />
            <path d="M11 11h4l2 2v6l-2 2h-4V11Zm2 2v6h1l1-1v-4l-1-1h-1Z" fill="#ffe3a1" />
            <path d="M17 11h2v5l1 2 1-2v-5h2v6l-2 4h-2l-2-4v-6Z" fill="#ffe3a1" />
            <rect x="10" y="25" width="3" height="1" fill="#080a18" />
            <rect x="15" y="25" width="3" height="1" fill="#080a18" />
            <rect x="20" y="25" width="2" height="1" fill="#080a18" />
          </g>
        </svg>
      </span>
    </div>
  );
}
