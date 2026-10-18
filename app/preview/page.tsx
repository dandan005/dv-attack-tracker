"use client";
import { WyvernTracker } from "@/components/WyvernTracker";

export default function Preview() {
  const els = ["wind", "fire", "earth", "water"] as const;
  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      {els.map((el) => (
        <WyvernTracker key={el} current={el as any} setBy={null} onSelect={async () => {}} />
      ))}
    </main>
  );
}
