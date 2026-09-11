export function DragonCrest() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 20 20"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* horns */}
      <rect x="4" y="1" width="2" height="3" fill="#8a6a2a" />
      <rect x="14" y="1" width="2" height="3" fill="#8a6a2a" />
      <rect x="3" y="3" width="2" height="2" fill="#8a6a2a" />
      <rect x="15" y="3" width="2" height="2" fill="#8a6a2a" />

      {/* head / skull */}
      <rect x="5" y="4" width="10" height="8" fill="#e0b559" />
      <rect x="6" y="3" width="8" height="1" fill="#e0b559" />
      <rect x="4" y="6" width="1" height="4" fill="#e0b559" />
      <rect x="15" y="6" width="1" height="4" fill="#e0b559" />

      {/* head shading */}
      <rect x="5" y="9" width="10" height="3" fill="#b98d3c" />

      {/* eyes */}
      <rect x="7" y="6" width="1" height="1" fill="#1a0d05" />
      <rect x="12" y="6" width="1" height="1" fill="#1a0d05" />
      <rect x="7" y="6" width="1" height="1" fill="#ff5c5c" opacity="0.9" />
      <rect x="12" y="6" width="1" height="1" fill="#ff5c5c" opacity="0.9" />

      {/* snout / jaw */}
      <rect x="8" y="11" width="4" height="2" fill="#c99a44" />
      <rect x="8" y="13" width="4" height="1" fill="#1a0d05" />

      {/* teeth */}
      <rect x="8" y="12" width="1" height="1" fill="#fff2bd" />
      <rect x="11" y="12" width="1" height="1" fill="#fff2bd" />

      {/* neck / collar */}
      <rect x="7" y="14" width="6" height="2" fill="#8a6a2a" />

      {/* wing flourishes either side */}
      <rect x="1" y="8" width="3" height="1" fill="#8a6a2a" />
      <rect x="1" y="9" width="2" height="1" fill="#8a6a2a" />
      <rect x="16" y="8" width="3" height="1" fill="#8a6a2a" />
      <rect x="17" y="9" width="2" height="1" fill="#8a6a2a" />
    </svg>
  );
}
