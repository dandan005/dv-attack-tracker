"use client";
import { useEffect, useState } from "react";
import { rankByTier, rankImg } from "@/lib/ranks";
import { gameAvatar } from "@/lib/gameAvatars";
import { PlayerEditor, type EditRow } from "@/components/PlayerEditor";

type Row = { id: string; username: string | null; avatar_url: string | null; custom_avatar?: string | null; promotion_tier: number | null; level: number | null; stage: number | null; guild_id: number | null };
type Data = { me: string; members: Row[]; roles?: { is_creator: boolean; is_admin: boolean; is_super_admin: boolean } };

export function PlayerList() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [g, setG] = useState("ALL");
  const [edit, setEdit] = useState<EditRow | "new" | null>(null);

  const load = () => fetch("/api/ranking?guild=ALL").then((r) => (r.ok ? r.json() : Promise.reject())).then((d: Data) => { setData(d); setErr(false); }).catch(() => setErr(true));
  useEffect(() => { load(); }, []);

  const staff = !!(data?.roles && (data.roles.is_creator || data.roles.is_admin || data.roles.is_super_admin));
  if (err) return <p className="text-xs text-slate-200/65">Could not load players.</p>;
  if (!data) return <p className="text-xs text-slate-200/65">Loading...</p>;
  if (!staff) return <p className="text-xs text-slate-200/65">Staff only.</p>;

  const rows = data.members
    .filter((m) => (g === "ALL" || String(m.guild_id) === g) && (m.username ?? "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.username ?? "").localeCompare(b.username ?? ""));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["ALL", "1", "2"].map((v) => (
          <button key={v} type="button" onClick={() => setG(v)} className="item-slot flex-1 p-2 text-xs" style={g === v ? { border: "1px solid #d4af5a" } : undefined}>{v === "ALL" ? "ALL" : "G" + v}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH NAME" className="item-slot flex-1 p-2 text-xs bg-transparent" />
        <button type="button" onClick={() => setEdit("new")} className="item-slot px-3 text-xs">+ ADD</button>
      </div>
      <p className="text-[10px] opacity-60">{rows.length} PLAYERS. TAP A PLAYER TO EDIT OR DELETE.</p>
      {rows.map((m) => {
        const r = rankByTier(m.promotion_tier);
        return (
          <div key={m.id} onClick={() => setEdit({ id: m.id, username: m.username, level: m.level, stage: m.stage, guild_id: m.guild_id, custom_avatar: m.custom_avatar, promotion_tier: m.promotion_tier })} className="item-slot p-2 flex items-center gap-2 cursor-pointer">
            <img src={(m.custom_avatar ? "/avatars/" + m.custom_avatar + ".png" : null) || gameAvatar(m.username) || m.avatar_url || "/icons/icon-192.png"} onError={(e) => { if (!e.currentTarget.src.endsWith("/icons/icon-192.png")) e.currentTarget.src = "/icons/icon-192.png"; }} alt="" className="w-7 h-7 pixel-frame border border-dv-line shrink-0 object-cover" />
            <span className="flex-1 truncate text-xs tracking-wider">{(m.username ?? "?").toUpperCase()}</span>
            <span className="text-[10px] opacity-60">{m.guild_id ? "G" + m.guild_id : ""}</span>
            {r ? <img src={rankImg(r.file)} alt="" className="w-5 h-5" style={{ imageRendering: "pixelated" }} /> : null}
          </div>
        );
      })}
      {edit && <PlayerEditor row={edit === "new" ? null : edit} defaultGuild={g === "ALL" ? null : Number(g)} onClose={() => setEdit(null)} onDone={() => { setEdit(null); load(); }} />}
    </div>
  );
}
