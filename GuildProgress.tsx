"use client";

import { PixelPanel, PixelHeader } from "./PixelPanel";

export type MemberRow = {
  discord_id: string;
  username: string;
  avatar_url: string | null;
  logged: boolean[]; // length 6, index 0 = D1
};

export function GuildProgress({
  members,
  onPingMissing,
  pinging,
}: {
  members: MemberRow[];
  onPingMissing: () => void;
  pinging: boolean;
}) {
  const missingCount = members.filter((m) => m.logged.some((l) => !l)).length;

  return (
    <PixelPanel className="mb-4 animate-rise">
      <PixelHeader
        icon="🐉"
        title="GUILD PROGRESS"
        right={
          <span className="text-[10px] bg-dv-bg text-dv-brassLight px-2 py-1 pixel-frame">
            {members.length} members
          </span>
        }
      />

      <div className="grid grid-cols-6 gap-1 text-center text-[9px] text-dv-brassLight mb-2">
        {[1, 2, 3, 4, 5, 6].map((d) => (
          <div key={d}>D{d}</div>
        ))}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {members.map((m) => (
          <div key={m.discord_id} className="flex items-center gap-2">
            <img
              src={m.avatar_url ?? "/icons/icon-192.png"}
              alt=""
              className="w-6 h-6 pixel-frame border border-dv-brass shrink-0"
            />
            <span className="text-[9px] flex-1 truncate">{m.username}</span>
            <div className="flex gap-1">
              {m.logged.map((done, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 pixel-frame ${
                    done ? "bg-dv-emerald" : "bg-dv-panel2 border border-dv-brass"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onPingMissing}
        disabled={missingCount === 0 || pinging}
        className="mt-4 w-full pixel-frame bg-dv-ember disabled:bg-dv-brass disabled:opacity-60 text-dv-bg text-[10px] py-3 shadow-pixel-sm active:translate-y-[2px]"
      >
        {missingCount === 0
          ? "EVERYONE HAS AT LEAST ONE ATTACK. NICE."
          : pinging
          ? "PINGING..."
          : `PING ${missingCount} MISSING MEMBER${missingCount > 1 ? "S" : ""} ON DISCORD`}
      </button>
    </PixelPanel>
  );
}
