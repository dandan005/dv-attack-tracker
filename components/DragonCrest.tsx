export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center brand-mark"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label="Dragon crest"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Dark pixel outline: horns, ears, wings, and jaw */}
        <path
          d="M3 16H1V9h3V5h3v3l2 3 4-3h8l4 3 2-3V5h3v4h3v7h-2v9h-4v3h-5v2h-4v2h-4v-2H9v-2H5v-3H3Z"
          fill="#351619"
        />
        {/* Red dragon silhouette */}
        <path
          d="M5 16H3v-5h3V8h1v5l4-3 5 2 5-2 4 3V8h1v3h3v5h-2v8h-4v3h-5v2h-4v-2h-5v-3H5Z"
          fill="#b52c24"
        />
        {/* Bright forehead and cheek pixels */}
        <path d="M11 13h3v-2h4v2h3v5h-2v4h-2v2h-4v-2h-2v-4h-2v-3h2Z" fill="#e94a2e" />
        <rect x="7" y="15" width="4" height="4" fill="#e94a2e" />
        <rect x="21" y="15" width="4" height="4" fill="#e94a2e" />
        {/* Horn and wing highlights */}
        <rect x="4" y="10" width="2" height="3" fill="#ff7135" />
        <rect x="26" y="10" width="2" height="3" fill="#ff7135" />
        <rect x="6" y="15" width="2" height="2" fill="#ff7135" />
        <rect x="24" y="15" width="2" height="2" fill="#ff7135" />
        {/* Square eyes and brows */}
        <rect x="10" y="15" width="4" height="2" fill="#42151a" />
        <rect x="18" y="15" width="4" height="2" fill="#42151a" />
        <rect x="11" y="15" width="2" height="1" fill="#ffd45c" />
        <rect x="19" y="15" width="2" height="1" fill="#ffd45c" />
        {/* Snout, nostrils, and fangs */}
        <rect x="12" y="19" width="8" height="4" fill="#8d201f" />
        <rect x="13" y="19" width="2" height="1" fill="#351619" />
        <rect x="17" y="19" width="2" height="1" fill="#351619" />
        <rect x="12" y="23" width="2" height="2" fill="#fff0c2" />
        <rect x="18" y="23" width="2" height="2" fill="#fff0c2" />
        {/* Pixel fire below the jaw */}
        <rect x="13" y="26" width="6" height="2" fill="#ff7135" />
        <rect x="14" y="28" width="4" height="2" fill="#ffb33e" />
        <rect x="15" y="30" width="2" height="1" fill="#ffd45c" />
        {/* Small scale pixels */}
        <rect x="9" y="21" width="1" height="1" fill="#ff7135" />
        <rect x="22" y="21" width="1" height="1" fill="#ff7135" />
      </svg>
    </div>
  );
}
