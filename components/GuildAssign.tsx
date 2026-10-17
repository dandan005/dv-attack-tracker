"use client";

import { useEffect, useState } from "react";

type Id = string | number;
type G = { id: number; code: string; name: string };
type M = { id: Id; username: string; guild_id: number | null };

export function GuildAssign() {
  const [data, setData] = useState<{ members: M[]; guilds: G[] } | null>(null);
  const [busy, setBusy] = useState<Id | null>(null);

  useEffect(() => {
    fetch("/api/assign-guild")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  async function assign(memberId: Id, value: string) {
    const guildId = value === "" ? null : Number(value);
    setBusy(memberId);
    const r = await fetch("/api/assign-guild", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, guild_id: guildId }),
    }).catch(() => null);
    if (r && r.ok) {
      setData((d) => d && { ...d, members: d.members.map((m) => (m.id === memberId ? { ...m, guild_id: guildId } : m)) });
    }
    setBusy(null);
  }

  return (
    <div className="mb-4">
      <div className="mb-2 text-[9px] tracking-[0.25em] text-dv-brassLight/80">GUILDS</div>
      <div className="flex flex-col gap-2">
        {data.members.map((m) => (
          <div key={String(m.id)} className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] text-dv-brassLight">{m.username || "(no name)"}</span>
            <select
              value={m.guild_id ?? ""}
              disabled={busy === m.id}
              onChange={(e) => assign(m.id, e.target.value)}
              className="border border-dv-line bg-transparent text-[10px] text-dv-brassLight"
            >
              <option value="">No guild</option>
              {data.guilds.map((g) => (
                <option key={g.id} value={g.id}>{g.code} · {g.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
