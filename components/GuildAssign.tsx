"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Id = string | number;
type G = { id: number; code: string; name: string };
type M = { id: Id; username: string; guild_id: number | null };

function GuildPicker({ name, guildId, guilds, busy, onSelect }: { name: string; guildId: number | null; guilds: G[]; busy: boolean; onSelect: (id: number | null) => void }) {
  const [open, setOpen] = useState(false);
  const current = guilds.find((g) => g.id === guildId);
  const options: { id: number | null; label: string }[] = [
    { id: null, label: "NO GUILD" },
    ...guilds.map((g) => ({ id: g.id, label: `${g.code} · ${g.name}` })),
  ];

  const popup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xs rounded-xl border-2 border-dv-line bg-dv-panel2"
        style={{ boxShadow: "0 0 0 2px #000, 0 0 24px rgba(212,175,90,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-dv-line bg-dv-panel2 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10px] tracking-widest text-dv-brassLight">CHOOSE GUILD</p>
            <p className="mt-1 truncate text-[8px] text-[#fdf3dc]">{name || "(NO NAME)"}</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="border border-dv-line px-2 py-0.5 text-[10px] text-[#fdf3dc]">X</button>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {options.map((o) => {
            const selected = o.id === guildId;
            return (
              <button
                key={String(o.id)}
                type="button"
                disabled={busy}
                onClick={() => { setOpen(false); if (!selected) onSelect(o.id); }}
                className={["flex w-full items-center justify-between rounded-md border px-3 py-3 text-[10px]", selected ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-black/20 text-[#fdf3dc]"].join(" ")}
                style={selected ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}
              >
                <span>{o.label}</span>
                <span className="text-[8px]">{selected ? "●" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen(true)}
        aria-label="Choose guild"
        className="flex h-6 shrink-0 items-center gap-1 border border-dv-line bg-dv-panel2 px-1.5 text-[9px] text-dv-brassLight"
      >
        {current ? `${current.code} · ${current.name}` : "NO GUILD"}
        <span className="text-[7px] text-[#fdf3dc]">▼</span>
      </button>
      {open && typeof document !== "undefined" && createPortal(popup, document.body)}
    </>
  );
}

let cache: { members: M[]; guilds: G[] } | null = null;

export function GuildAssign() {
  const [data, setData] = useState<{ members: M[]; guilds: G[] } | null>(cache);
  const [busy, setBusy] = useState<Id | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/assign-guild")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { cache = d; setData(d); } else setFailed(true); })
      .catch(() => {});
  }, []);

  useEffect(() => { if (data) cache = data; }, [data]);
  if (failed) return null;
  if (!data) return (<div className="mb-4"><div className="mb-2 text-[9px] tracking-[0.25em] text-dv-brassLight/80">GUILDS</div><div className="text-[9px] text-[#fdf3dc]">LOADING...</div></div>);

  async function assign(memberId: Id, guildId: number | null) {
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
            <GuildPicker name={m.username} guildId={m.guild_id} guilds={data.guilds} busy={busy === m.id} onSelect={(id) => assign(m.id, id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
