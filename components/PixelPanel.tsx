export function PixelPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "pixel-frame pixel-border panel-glow bg-dv-panel shadow-pixel p-4 " + className
      }
    >
      {children}
    </div>
  );
}

export function PixelHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="pixel-frame flex items-center justify-between bg-gradient-to-r from-dv-violet to-dv-brass px-3 py-3 mb-4 shadow-pixel-sm">
      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-dv-bg">
        <span className="grid place-items-center w-7 h-7 pixel-frame bg-dv-bg/20 text-sm">
          {icon}
        </span>
        <span className="tracking-wider">{title}</span>
      </div>
      {right}
    </div>
  );
}
