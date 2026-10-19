"use client";
import { useState } from "react";

export type EditRow = { id: string; username: string | null; level: number | null; stage: number | null; guild_id: number | null };

const box = "mt-1 h-8 w-full border border-dv-line bg-black/40 px-2 text-[11px] text-slate-200";

export function PlayerEditor({ row, defaultGuild, onClose, onDone }: { row: EditRow | null; defaultGuild: number | null; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(row?.level != null ? String(row.level) : "");
  const [stage, setStage] = useState(row?.stage != null ? String(row.stage) : "");
  const [guild, setGuild] = useState<number | null>(row ? row.guild_id : defaultGuild);
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [msg, setMsg] = useState("");

  async function send(action: "add" | "edit" | "delete") {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: row?.id, name, level, stage, guild_id: guild }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setMsg(j?.error || "Failed");
        setBusy(false);
        return;
      }
      onDone();
    } catch {
      setMsg("Network error");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="pixel-border bg-dv-panel shadow-pixel w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow mb-2">{row ? "EDIT PLAYER" : "ADD PLAYER"}</p>
        {row ? (
          <h2 className="text-lg text-dv-brassLight">{row.username || "-"}</h2>
        ) : (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="IN-GAME NAME" maxLength={40} className={box} />
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="min-w-0"><span className="eyebrow">LEVEL</span><input inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value.replace(/\D/g, ""))} className={box} /></label>
          <label className="min-w-0"><span className="eyebrow">STAGE</span><input inputMode="numeric" value={stage} onChange={(e) => setStage(e.target.value.replace(/\D/g, ""))} className={box} /></label>
        </div>
        <p className="eyebrow mb-1 mt-3">GUILD</p>
        <div className="flex gap-2">
          {([null, 1, 2] as (number | null)[]).map((g) => (
            <button key={String(g)} type="button" onClick={() => setGuild(g)} className={["h-7 flex-1 border text-[9px]", g === guild ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80"].join(" ")}>{g === null ? "NO GUILD" : "G" + g}</button>
          ))}
        </div>
        {msg && <p className="mt-2 text-[10px] text-red-400">{msg}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" disabled={busy || (!row && !name.trim())} onClick={() => send(row ? "edit" : "add")} className="h-8 flex-1 border border-dv-brass bg-black/40 text-[10px] text-dv-brassLight disabled:opacity-40">SAVE</button>
          <button type="button" onClick={onClose} className="h-8 flex-1 border border-dv-line bg-dv-panel2 text-[10px] text-slate-300/80">CANCEL</button>
        </div>
        {row && (
          <button type="button" disabled={busy} onClick={() => (sure ? send("delete") : setSure(true))} className="mt-2 h-7 w-full border border-red-500/60 bg-red-950/40 text-[9px] text-red-300">
            {sure ? "TAP AGAIN TO CONFIRM" : row.id.startsWith("roster-") ? "DELETE PLAYER" : "REMOVE FROM GUILD"}
          </button>
        )}
      </div>
    </div>
  );
}
