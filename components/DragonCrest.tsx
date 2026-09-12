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
        aria-label="Dragon Valley Attack Ledger guild mark"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Inner guild seal: a simple pixel shield inside the app's brass badge */}
        <path
          d="M6 5h20v13l-2 5-8 5-8-5-2-5V5Z"
          fill="#080a18"
        />
        <path
          d="M8 7h16v10l-2 4-6 4-6-4-2-4V7Z"
          fill="#8b7dff"
        />
        <path
          d="M10 9h12v8l-2 3-4 3-4-3-2-3V9Z"
          fill="#080a18"
        />
        {/* Interlocking pixel DV monogram */}
        <path
          d="M11 11h4l2 2v6l-2 2h-4V11Zm2 2v6h1l1-1v-4l-1-1h-1Z"
          fill="#ffe3a1"
        />
        <path
          d="M17 11h2v5l1 2 1-2v-5h2v6l-2 4h-2l-2-4v-6Z"
          fill="#ffe3a1"
        />
        {/* Ledger ticks: three recorded attack entries */}
        <rect x="10" y="25" width="3" height="1" fill="#080a18" />
        <rect x="15" y="25" width="3" height="1" fill="#080a18" />
        <rect x="20" y="25" width="2" height="1" fill="#080a18" />
      </svg>
    </div>
  );
}
