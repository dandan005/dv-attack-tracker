export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Dragon Wings / Horns Silhouette Background */}
      <div
        className="absolute inset-0 shadow-pixel-sm transition-transform hover:scale-105"
        style={{
          clipPath: "polygon(50% 0%, 85% 15%, 100% 45%, 75% 70%, 90% 100%, 50% 85%, 10% 100%, 25% 70%, 0% 45%, 15% 15%)",
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #7f1d1d 100%)",
        }}
      />

      {/* Inner Scaled Shield Core */}
      <div
        className="absolute inset-1 grid place-items-center font-pixel text-amber-200"
        style={{
          fontSize: Math.round(size * 0.22),
          clipPath: "polygon(50% 5%, 90% 20%, 90% 75%, 50% 95%, 10% 75%, 10% 20%)",
          background: "linear-gradient(180deg, #451a03 0%, #291102 100%)",
          boxShadow: "inset 0 0 4px rgba(252, 211, 77, 0.4)",
        }}
      >
        <span className="tracking-tighter drop-shadow-[0_1px_1px_rgba(239,68,68,0.8)]">
          DV
        </span>
      </div>

      {/* Top Dragon Horn/Spike Highlights */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-amber-400"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />
    </div>
  );
}
