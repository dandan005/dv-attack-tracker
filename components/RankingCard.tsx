"use client";
import { useEffect, useState } from "react";
import { rankByTier, rankImg } from "@/lib/ranks";
import { gameAvatar } from "@/lib/gameAvatars";
import { PixelPanel } from "@/components/PixelPanel";
import { PlayerEditor, type EditRow } from "@/components/PlayerEditor";

type Row = { id: string; username: string | null; avatar_url: string | null; custom_avatar?: string | null; promotion_tier: number | null; level: number | null; stage: number | null; dv_map: string | null; gr_boss: number | null; guild_id: number | null };
type Data = { me: string; members: Row[]; roles?: { is_creator: boolean; is_admin: boolean; is_super_admin: boolean } };

const TABS = [{ v: "ALL", label: "ALL" }, { v: "1", label: "G1" }, { v: "2", label: "G2" }];
const MAPS: Record<string, string> = { wasteland: "WASTELAND", lava: "LAVA MTS", icevale: "ICEVALE", windcliff: "WINDCLIFF" };

const cache: Record<string, Data> = {};
const load = (v: string) => fetch("/api/ranking?guild=" + v).then((r) => (r.ok ? r.json() : Promise.reject())).then((d: Data) => { cache[v] = d; return d; });
if (typeof window !== "undefined") { for (const t of TABS) load(t.v).catch(() => {}); }

export function RankingCard() {
  const [view, setView] = useState("ALL");
  const [data, setData] = useState<Data | null>(cache["ALL"] ?? null);
  const [err, setErr] = useState(false);
  const [all, setAll] = useState(false);
  const [edit, setEdit] = useState<EditRow | "new" | null>(null);

  useEffect(() => {
    let off = false;
    setData(cache[view] ?? null);
    setErr(false);
    setAll(false);
    load(view)
      
      .then((d) => { if (!off) setData(d); })
      .catch(() => { if (!off && !cache[view]) setErr(true); });
    return () => { off = true; };
  }, [view]);

  const staff = !!(data?.roles && (data.roles.is_creator || data.roles.is_admin || data.roles.is_super_admin));
  const refresh = () => Promise.all(TABS.map((t) => load(t.v).catch(() => null))).then(() => { setData(cache[view] ?? null); setEdit(null); });
  const list = data?.members ?? [];
  const shown = all ? list : list.slice(0, 10);

  return (
    <PixelPanel className="animate-rise">
      <div className="mb-3 flex gap-2">
        {TABS.map((t) => (
          <button key={t.v} type="button" onClick={() => setView(t.v)} className={["h-6 flex-1 border px-2 text-[9px]", t.v === view ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-[#f3e4c7]/85"].join(" ")} style={t.v === view ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>{t.label}</button>
        ))}
      </div>
      {err && <p className="eyebrow py-2">COULD NOT LOAD</p>}
      {!err && !data && <p className="eyebrow py-2">LOADING...</p>}
      {!err && data && <div className="flex items-center justify-between"><p className="eyebrow py-2">{list.length} PLAYERS</p></div>}
      <div className="space-y-2">
        {shown.map((m, i) => {
          const r = rankByTier(m.promotion_tier);
          const isMe = m.id === data?.me;
          const stats: [string, string, string][] = [
            ["LEVEL", m.level != null ? String(m.level) : "-", "text-[#f3e4c7]/85"],
            ["STAGE", m.stage != null ? String(m.stage) : "-", "text-dv-emerald"],
          ];
          return (
            <div key={m.id} onClick={staff ? () => setEdit({ id: m.id, username: m.username, level: m.level, stage: m.stage, guild_id: m.guild_id, custom_avatar: m.custom_avatar, promotion_tier: m.promotion_tier }) : undefined} className={"item-slot p-2" + (staff ? " cursor-pointer" : "")} style={isMe ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>
              <div className="flex items-center gap-2 min-w-0 mb-2">
                <span className="relative w-8 h-8 shrink-0 flex items-center justify-center"><img src={"/ranks/" + (m.stage == null ? "pos-default" : i === 0 ? "pos-gold" : i === 1 ? "pos-silver" : i === 2 ? "pos-bronze" : "pos-default") + ".png"} alt="" className="absolute inset-0 w-full h-full object-contain" /><span className="relative text-[10px] font-bold text-white" style={{ textShadow: "0 0 3px #000, 0 0 3px #000" }}>{m.stage != null ? i + 1 : "-"}</span></span>
                <img src={(m.custom_avatar ? "/avatars/" + m.custom_avatar + ".png" : null) || gameAvatar(m.username) || m.avatar_url || "/icons/icon-192.png"} onError={(e) => { if (!e.currentTarget.src.endsWith("/icons/icon-192.png")) e.currentTarget.src = "/icons/icon-192.png"; }} alt="" className="w-7 h-7 pixel-frame border border-dv-line shrink-0 object-cover" />
                <span className="block text-[11px] text-[#f3e4c7]/85 break-words leading-tight">{m.username || "-"}</span>
                {isMe && <span className="text-[8px] text-dv-emerald shrink-0">(YOU)</span>}
                <span className="flex-1" />
                {r && <span className="flex items-center gap-1 text-[9px] text-[#f3e4c7]/85 shrink-0"><img src={rankImg(r.file)} alt="" className="h-4 w-4" />{r.name}</span>}
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
      {list.length > 10 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-3 h-6 w-full border border-dv-line bg-dv-panel2 text-[9px] text-[#f3e4c7]/85">{all ? "SHOW LESS" : "SHOW ALL (" + list.length + ")"}</button>
      )}
    {edit && <PlayerEditor row={edit === "new" ? null : edit} defaultGuild={view === "ALL" ? null : Number(view)} onClose={() => setEdit(null)} onDone={refresh} />}
    </PixelPanel>
  );
}
