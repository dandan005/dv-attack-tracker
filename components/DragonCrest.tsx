export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center brand-mark"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Dragon crest"
        shapeRendering="crispEdges"
      >
        <path
          d="M12 18 6 9l4 18 7 5-5 8 8-3 4 10 7-7 7 7 4-10 8 3-5-8 7-5 4-18-6 9-7-6-5 8-7-4-7 4-5-8-7 6Z"
          fill="#8f211d"
          stroke="#3b1715"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <path
          d="M16 27 23 18h18l7 9-5 20-9 8-9-8-5-20Z"
          fill="#d83a24"
          stroke="#3b1715"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <path d="m23 19 9 5 9-5-3 10H26l-3-10Z" fill="#ff6b32" />
        <path d="m17 28 8 3-3 8-7-5 2-6Zm30 0-8 3 3 8 7-5-2-6Z" fill="#ff6b32" />
        <path d="M25 39h14l-3 11-4 4-4-4-3-11Z" fill="#a9231f" />
        <path d="m22 29 5 3-2 5-5-2 2-6Zm20 0-5 3 2 5 5-2-2-6Z" fill="#ffd36b" />
        <path d="M27 43h10l-5 6-5-6Z" fill="#ff9a3c" />
        <path d="M25 52 21 60l8-5m10-3 4 8-8-5" fill="#ff6b32" stroke="#3b1715" strokeWidth="2" />
      </svg>
    </div>
  );
}
