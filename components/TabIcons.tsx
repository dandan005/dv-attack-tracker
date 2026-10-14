type IconProps = { className?: string };

const SVG_PROPS = {
  viewBox: "0 0 16 16",
  width: "1em",
  height: "1em",
  fill: "currentColor",
  shapeRendering: "crispEdges",
  "aria-hidden": true,
} as const;

export function LedgerIcon({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <rect x="2" y="9" width="3" height="5" />
      <rect x="6" y="5" width="3" height="9" />
      <rect x="10" y="2" width="3" height="12" />
      <rect x="1" y="14" width="14" height="2" />
    </svg>
  );
}

export function GuideIcon({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <path d="M1 3h6v11H1z M9 3h6v11H9z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 6h2M3 8h2M3 10h2M11 6h2M11 8h2M11 10h2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function CookingIcon({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <rect x="7" y="0" width="1" height="2" />
      <rect x="10" y="1" width="1" height="2" />
      <rect x="1" y="5" width="14" height="2" />
      <rect x="2" y="7" width="12" height="5" />
      <rect x="3" y="13" width="2" height="2" />
      <rect x="7" y="12" width="2" height="3" />
      <rect x="11" y="13" width="2" height="2" />
    </svg>
  );
}

export function SpecialIcon({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <rect x="2" y="2" width="1" height="1" />
      <rect x="13" y="1" width="1" height="1" />
      <rect x="12" y="4" width="1" height="1" />
      <rect x="6" y="4" width="4" height="1" />
      <rect x="5" y="5" width="6" height="1" />
      <rect x="4" y="6" width="8" height="2" />
      <rect x="1" y="9" width="14" height="2" />
      <rect x="2" y="11" width="12" height="2" />
    </svg>
  );
}

export function RunesIcon({ className }: IconProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <defs>
        <mask id="rune-stone-carve">
          <rect x="0" y="0" width="16" height="16" fill="#fff" />
          <path d="M6.5 4v8" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M6.5 4h2l2 2-2 2h-2" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M9.5 8l2 4" stroke="#000" strokeWidth="1" fill="none" />
        </mask>
      </defs>
      <rect x="3" y="1" width="10" height="14" rx="2" mask="url(#rune-stone-carve)" />
    </svg>
  );
}