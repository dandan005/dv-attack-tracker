export function DragonCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="shrink-0 shadow-pixel-sm grid place-items-center font-pixel text-dv-bg"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.26),
        clipPath: "polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)",
        background: "linear-gradient(180deg, #e6c06a 0%, #c99a44 55%, #a97c33 100%)",
      }}
    >
      DV
    </div>
  );
}
