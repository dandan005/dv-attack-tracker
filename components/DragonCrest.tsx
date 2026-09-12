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
        aria-label="Dragon Valley Attack Ledger logo"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Block-built DV guild monogram */}
        <path
          d="M5 6h8v2h3v3h2v10h-2v3h-3v2H5V6Zm3 4v12h4v-2h2v-8h-2v-2H8Z"
          fill="#080a18"
        />
        <path
          d="M18 6h3v7h2v5h2V6h3v13h-2v4h-2v3h-4v-3h-2v-4h-2V6h2Z"
          fill="#080a18"
        />
        {/* Ledger rule and completed attack marker */}
        <rect x="8" y="25" width="13" height="2" fill="#8b7dff" />
        <rect x="22" y="25" width="2" height="2" fill="#080a18" />
        <path d="m24 22 2 2 4-5v4l-4 5-2-2Z" fill="#8b7dff" />
        {/* Small brass pixel glints */}
        <rect x="5" y="4" width="2" height="2" fill="#fff0c5" />
        <rect x="27" y="4" width="2" height="2" fill="#fff0c5" />
      </svg>
    </div>
  );
}
