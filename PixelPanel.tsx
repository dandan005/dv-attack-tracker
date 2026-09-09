export function PixelPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`pixel-frame pixel-border bg-dv-panel shadow-pixel p-4 ${className}`}
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
    <div className="pixel-frame flex items-center justify-between bg-dv-brass px-4 py-3 mb-4 shadow-pixel-sm">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-dv-bg">
        {icon}
        <span>{title}</span>
      </div>
      {right}
    </div>
  );
}
