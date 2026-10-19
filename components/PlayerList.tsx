"use client";
import { useEffect, useState } from "react";
import { rankByTier, rankImg } from "@/lib/ranks";
import { gameAvatar } from "@/lib/gameAvatars";
import { PlayerEditor, type EditRow } from "@/components/PlayerEditor";

type Row = { id: string; username: string | null; avatar_url: string | null; custom_avatar?: string | null; promotion_tier: number | null; level: number | null; stage: number | null; guild_id: number | null };
type Data = { me: string; members: Row[]; roles?: { is_creator: boolean; is_admin: boolean; is_super_admin: boolean } };

const glow = { border: "1px solid #d4af5a", background: "rgba(0,0,0,0.5)", boxShadow: "0 0 8px rgba(212,175,90,0.5)" };

export function PlayerList() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [g, setG] = useState("ALL");
  const [all, setAll] = useState(false);
  const [edit, setEdit] = useState<EditRow | "new" | null>(null);

  const load = () => fetch("/api/ranking?guild=ALL").then((r) => (r.ok ? r.json() : Promise.reject())).then((d: Data) => { setData(d); setErr(false); }).catch(() => setErr(true));
  useEffect(() => { load(); }, []);

  const staff = !!(data?.roles && (data.roles.is_creator || data.roles.is_admin || data.roles.is_super_admin));
  if (err) return <p className="text-[10px] text-slate-200/65">Could not load players.</p>;
  if (!data) return <p className="text-[10px] text-slate-200/65">Loading...</p>;
  if (!staff) return <p className="text-[10px] text-slate-200/65">Staff only.</p>;

  const rows = data.members
    .filter((m) => (g === "ALL" || String(m.guild_id) === g) && (m.username ?? "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.username ?? "").localeCompare(b.username ?? ""));
  const list = all || q ? rows : rows.slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["ALL", "1", "2"].map((v) => (
          <button key={v} type="button" onClick={() => { setG(v); setAll(false); }} className="item-slot flex-1 p-2 text-[10px] text-slate-200/80" style={g === v ? glow : undefined}>{v === "ALL" ? "ALL" : "G" + v}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH NAME" className="flex-1 min-w-0 h-8 px-2 border border-dv-line bg-dv-panel2 text-[10px] text-slate-200/80 outline-none" />
        <button type="button" onClick={() => setEdit("new")} className="h-8 px-3 border border-dv-line bg-dv-panel2 text-[10px] text-slate-200/80">+ ADD</button>
      </div>
      <p className="eyebrow">{rows.length} PLAYERS / TAP TO EDIT OR DELETE</p>
      <div className="space-y-2">
        {list.map((m) => {
          const r = rankByTier(m.promotion_tier);
          const stats: [string, string, string][] = [
            ["LEVEL", m.level != null ? String(m.level) : "-", "text-slate-200/80"],
            ["STAGE", m.stage != null ? String(m.stage) : "-", "text-dv-emerald"],
          ];
          return (
            <div key={m.id} onClick={() => setEdit({ id: m.id, username: m.username, level: m.level, stage: m.stage, guild_id: m.guild_id, custom_avatar: m.custom_avatar, promotion_tier: m.promotion_tier })} className="item-slot p-2 cursor-pointer">
              <div className="flex items-center gap-2 min-w-0 mb-2">
                <img src={(m.custom_avatar ? "/avatars/" + m.custom_avatar + ".png" : null) || gameAvatar(m.username) || m.avatar_url || "/icons/icon-192.png"} onError={(e) => { if (!e.currentTarget.src.endsWith("/icons/icon-192.png")) e.currentTarget.src = "/icons/icon-192.png"; }} alt="" className="w-7 h-7 pixel-frame border border-dv-line shrink-0 object-cover" />
                <span className="block text-[11px] text-slate-200/80 break-words leading-tight">{m.username || "-"}</span>
                <span className="flex-1" />
                {m.guild_id ? <span className="text-[9px] text-dv-emerald shrink-0">G{m.guild_id}</span> : null}
                {r && <span className="flex items-center gap-1 text-[9px] text-slate-200/80 shrink-0"><img src={rankImg(r.file)} alt="" className="h-4 w-4" />{r.name}</span>}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {stats.map(([l, v, c]) => (
                  <div key={l} className="min-w-0"><p className="eyebrow">{l}</p><p className={"truncate text-[10px] mt-1 " + c}>{v}</p></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!q && rows.length > 10 && (
        <button type="button" onClick={() => setAll(!all)} className="h-6 w-full border border-dv-line bg-dv-panel2 text-[9px] text-slate-300/80">{all ? "SHOW LESS" : "SHOW ALL (" + rows.length + ")"}</button>
      )}
      {edit && <PlayerEditor row={edit === "new" ? null : edit} defaultGuild={g === "ALL" ? null : Number(g)} onClose={() => setEdit(null)} onDone={() => { setEdit(null); load(); }} />}
    </div>
  );
}
