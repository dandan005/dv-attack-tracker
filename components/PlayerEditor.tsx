"use client";
import { useState } from "react";
import { RankPicker } from "./RankPicker";
import { squareAvatar } from "@/lib/squareAvatar";

export type EditRow = { id: string; username: string | null; level: number | null; stage: number | null; guild_id: number | null; custom_avatar?: string | null; custom_avatar_url?: string | null; promotion_tier?: number | null };

const AVATARS = ["aruben", "babayagan", "beastmarck", "boocarcake", "chrollo", "chrysalis", "crayon", "crzydmnd", "crzydmndo", "dagor", "dyng", "ecchigarai", "eyir", "gato", "junglejuic", "kitodi", "kkmi", "mangtataho", "miir", "mirai", "momoooo", "mrky0099", "myongy", "paultraits", "peco", "peeakyy", "raenzy", "renzyyy23", "ryheart", "saika", "sammie", "slothy", "tambai", "tambaiv2", "tanicaj", "vicepogi", "walkngfarm", "wawekz", "zannin"];

const box = "mt-1 h-8 w-full border border-dv-line bg-black/40 px-2 text-[11px] text-slate-200";

export function PlayerEditor({ row, defaultGuild, onClose, onDone }: { row: EditRow | null; defaultGuild: number | null; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(row?.username ?? "");
  const [level, setLevel] = useState(row?.level != null ? String(row.level) : "");
  const [stage, setStage] = useState(row?.stage != null ? String(row.stage) : "");
  const [guild, setGuild] = useState<number | null>(row ? row.guild_id : defaultGuild);
  const [avatar, setAvatar] = useState<string | null>(row?.custom_avatar ?? null);
  const [tier, setTier] = useState<number | null>(row?.promotion_tier ?? null);
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [msg, setMsg] = useState("");
  const [upUrl, setUpUrl] = useState<string | null>(row?.custom_avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [changed, setChanged] = useState(false);

  // Close; if a picture was uploaded or removed, refresh the list behind us too.
  const close = () => (changed ? onDone() : onClose());

  async function uploadAvatar(file: File) {
    if (!row) return;
    setUploading(true);
    setMsg("");
    try {
      const blob = await squareAvatar(file);
      const fd = new FormData();
      fd.append("id", row.id);
      fd.append("file", new File([blob], "avatar.webp", { type: blob.type }));
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      const j = await res.json().catch(() => null);
      if (!res.ok) setMsg(j?.error || "Upload failed");
      else { setUpUrl(j.url); setChanged(true); }
    } catch {
      setMsg("Could not read that image");
    }
    setUploading(false);
  }

  async function removeUpload() {
    if (!row) return;
    setUploading(true);
    setMsg("");
    const res = await fetch("/api/avatar", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id }) }).catch(() => null);
    if (res && res.ok) { setUpUrl(null); setChanged(true); } else setMsg("Remove failed");
    setUploading(false);
  }

  async function send(action: "add" | "edit" | "delete") {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: row?.id, name, level, stage, guild_id: guild, avatar: avatar ?? "", tier }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={close}>
      <div className="pixel-border bg-dv-panel shadow-pixel max-h-[90vh] w-full max-w-sm overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow mb-2">{row ? "EDIT PLAYER" : "ADD PLAYER"}</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="IN-GAME NAME" maxLength={40} className={box} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="min-w-0"><span className="eyebrow">LEVEL</span><input inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value.replace(/\D/g, ""))} className={box} /></label>
          <label className="min-w-0"><span className="eyebrow">STAGE</span><input inputMode="numeric" value={stage} onChange={(e) => setStage(e.target.value.replace(/\D/g, ""))} className={box} /></label>
        </div>
        <p className="eyebrow mb-1 mt-3">GUILD</p>
        <div className="flex gap-2">
          {([null, 1, 2] as (number | null)[]).map((g) => (
            <button key={String(g)} type="button" onClick={() => setGuild(g)} className={["h-7 flex-1 border text-[9px]", g === guild ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-[#fdf3dc]"].join(" ")}>{g === null ? "NO GUILD" : "G" + g}</button>
          ))}
        </div>
        <p className="eyebrow mb-1 mt-3">RANK</p>
        <RankPicker tier={tier} onSelect={setTier} />
        <p className="eyebrow mb-1 mt-3">AVATAR</p>
        {row && (
          <div className="mb-2 flex items-center gap-2">
            {upUrl && <img src={upUrl} alt="" className="h-8 w-8 border border-dv-brass object-cover" />}
            <label className="flex h-8 flex-1 cursor-pointer items-center justify-center border border-dv-line bg-dv-panel2 text-[9px] text-[#fdf3dc]">
              {uploading ? "WORKING..." : "UPLOAD PICTURE"}
              <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadAvatar(f); }} />
            </label>
            {upUrl && <button type="button" disabled={uploading} onClick={removeUpload} className="h-8 border border-red-500/60 bg-red-950/40 px-2 text-[9px] text-red-300">REMOVE</button>}
          </div>
        )}
        <div className="grid max-h-36 grid-cols-6 gap-1 overflow-y-auto">
          <button type="button" onClick={() => { setAvatar(null); if (upUrl) removeUpload(); }} className={["h-10 border text-[8px]", avatar === null ? "border-dv-brass text-dv-brassLight" : "border-dv-line text-[#fdf3dc]"].join(" ")}>AUTO</button>
          {AVATARS.map((a) => (
            <button key={a} type="button" onClick={() => { setAvatar(a); if (upUrl) removeUpload(); }} className={["border p-0.5", a === avatar ? "border-dv-brass" : "border-dv-line"].join(" ")}><img src={"/avatars/" + a + ".png"} alt={a} className="h-9 w-full object-contain" /></button>
          ))}
        </div>
        {msg && <p className="mt-2 text-[10px] text-red-400">{msg}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" disabled={busy || (!row && !name.trim())} onClick={() => send(row ? "edit" : "add")} className="h-8 flex-1 border border-dv-brass bg-black/40 text-[10px] text-dv-brassLight disabled:opacity-40">SAVE</button>
          <button type="button" onClick={close} className="h-8 flex-1 border border-dv-line bg-dv-panel2 text-[10px] text-[#fdf3dc]">CANCEL</button>
        </div>
        {row && (
          <button type="button" disabled={busy} onClick={() => (sure ? send("delete") : setSure(true))} className="mt-2 h-7 w-full border border-red-500/60 bg-red-950/40 text-[9px] text-red-300">
            {sure ? "TAP AGAIN TO CONFIRM" : row.id.startsWith("roster-") ? "DELETE PLAYER" : "DELETE ACCOUNT"}
          </button>
        )}
      </div>
    </div>
  );
}
