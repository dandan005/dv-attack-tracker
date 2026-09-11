export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 shadow-pixel-sm"
      style={{
        width: size,
        height: size,
        clipPath: "polygon(50% 0%, 100% 36%, 81% 100%, 19% 100%, 0% 36%)",
        background: "linear-gradient(180deg, #e6c06a 0%, #c99a44 55%, #a97c33 100%)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg width={Math.round(size * 0.64)} height={Math.round(size * 0.64)} viewBox="0 0 28 28" shapeRendering="crispEdges">
        {/* faceted dragon head silhouette */}
        <polygon
          points="14,1 16,5 20,3 19,7 24,6 21,10 25,11 20,13 22,16 17,15 18,20 15,17 14,22 13,17 10,20 11,15 6,16 8,13 3,11 7,10 4,6 9,7 8,3 12,5"
          fill="#2a1a0a"
        />
        {/* crystal-facet highlight, upper-left plane */}
        <polygon points="14,3 17,7 14,10 11,7" fill="#6b4a1f" />
        {/* crystal-facet highlight, lower plane */}
        <polygon points="11,10 14,13 17,10 14,17" fill="#4a3115" />
        {/* eyes */}
        <rect x="10.5" y="9" width="1.6" height="1.6" fill="#ff5c3c" />
        <rect x="15.9" y="9" width="1.6" height="1.6" fill="#ff5c3c" />
      </svg>
    </div>
  );
}
