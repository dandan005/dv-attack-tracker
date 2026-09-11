export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="shrink-0 font-pixel flex items-center justify-center brand-mark"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.3),
      }}
    >
      DV
    </div>
  );
}
