"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { WyvernTracker } from "@/components/WyvernTracker";

type Settings = {
  anchor_date: string;
  reset_hour_utc: number;
  wyvern_element: string | null;
  wyvern_set_by: string | null;
};

type CurrentMember = {
  username: string;
  avatar_url: string | null;
  discord_id: string;
};

type AttackLog = {
  member_id: string;
  day_number: number;
  promotion_tier?: number | null;
  damage_score?: number | string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({ anchor_date: "2026-01-05", reset_hour_utc: 0, wyvern_element: null, wyvern_set_by: null });
  const [myLoggedDays, setMyLoggedDays] = useState<number[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentMember | null>(null);

  const { dayNumber, cycleStartISO } = getCycleInfo(settings.anchor_date, settings.reset_hour_utc);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const { data: settingsRow } = await supabase.from("app_settings").select("*").eq("id", 1).single();
    const currentSettings: Settings = {
      anchor_date: settingsRow?.anchor_date ?? "2026-01-05",
      reset_hour_utc: settingsRow?.reset_hour_utc ?? 0,
      wyvern_element: settingsRow?.wyvern_element ?? null,
      wyvern_set_by: settingsRow?.wyvern_set_by ?? null,
    };
    setSettings(currentSettings);
    const cycle = getCycleInfo(currentSettings.anchor_date, currentSettings.reset_hour_utc);

    const { data: allMembers } = await supabase.from("members").select("id, auth_user_id, discord_id, username, avatar_url");
    const advancedLogs = await supabase.from("attack_logs").select("member_id, day_number, promotion_tier, damage_score").eq("cycle_start", cycle.cycleStartISO);
    let logs: AttackLog[] = advancedLogs.data as AttackLog[] | null ?? [];
    if (advancedLogs.error) {
      const legacyLogs = await supabase.from("attack_logs").select("member_id, day_number").eq("cycle_start", cycle.cycleStartISO);
      logs = (legacyLogs.data ?? []) as AttackLog[];
    }

    const logsByMember = new Map<string, Map<number, AttackLog>>();
    logs.forEach((log) => {
      if (!logsByMember.has(log.member_id)) logsByMember.set(log.member_id, new Map());
      logsByMember.get(log.member_id)!.set(log.day_number, log);
    });

    const rows: MemberRow[] = (allMembers ?? []).map((member: any) => {
      const memberLogs = logsByMember.get(member.id) ?? new Map<number, AttackLog>();
      const entries = Array.from(memberLogs.values());
      return {
        discord_id: member.discord_id,
        username: member.username,
        avatar_url: member.avatar_url,
        logged: [1, 2, 3, 4, 5, 6].map((day) => memberLogs.has(day)),
        score: entries.reduce((sum, log) => sum + (Number(log.damage_score) || 0), 0),
        bestPromotion: entries.reduce<number | null>((best, log) => log.promotion_tier === null || log.promotion_tier === undefined ? best : best === null ? Number(log.promotion_tier) : Math.max(best, Number(log.promotion_tier)), null),
      };
    });
    setMembers(rows);

    const myRow = (allMembers ?? []).find((member: any) => member.auth_user_id === user.id);
    if (myRow) {
      const myLogs = logsByMember.get(myRow.id) ?? new Map<number, AttackLog>();
      setMyLoggedDays([1, 2, 3, 4, 5, 6].filter((day) => myLogs.has(day)));
      setMe({ username: myRow.username, avatar_url: myRow.avatar_url, discord_id: myRow.discord_id });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function logAttack(day: number, promotionTier: number | null, damageScore: number | null) {
    const res = await fetch("/api/log-attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber: day, promotionTier, damageScore }),
    });
    if (res.ok) {
      setToast("D" + day + " attack logged ⚔️");
      await loadAll();
      setTimeout(() => setToast(null), 2500);
    } else {
      const json = await res.json().catch(() => ({}));
      setToast(json.error ?? "Could not log attack");
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function pingMissing() {
    setPinging(true);
    const res = await fetch("/api/ping-missing", { method: "POST" });
    const json = await res.json();
    setPinging(false);
    setToast(res.ok ? "Pinged " + json.missing + " member(s) on Discord" : json.error);
    setTimeout(() => setToast(null), 3000);
  }

  async function setWyvern(element: "wind" | "fire" | "earth" | "water") {
    await supabase.from("app_settings").update({ wyvern_element: element, wyvern_set_by: me?.username ?? null }).eq("id", 1);
    setSettings((current) => ({ ...current, wyvern_element: element, wyvern_set_by: me?.username ?? null }));
    setToast("Wyvern trace set to " + element.toUpperCase());
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[10px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p></main>;

  return (
    <>
      <header className="sticky top-0 z-50 px-4 py-3 bg-dv-bg/90 backdrop-blur-md border-b border-dv-line">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0"><div className="grid place-items-center w-9 h-9 pixel-frame bg-dv-brass text-dv-bg text-[9px] shadow-pixel-sm shrink-0">DV</div><div className="min-w-0"><p className="eyebrow truncate">DRAGON VALLEY // LIVE BOARD</p><h1 className="text-[11px] sm:text-xs text-dv-brassLight mt-1">ATTACK LEDGER</h1></div></div>
          <div className="flex items-center gap-2 shrink-0"><span className="status-chip hidden sm:inline-flex">D{dayNumber} ACTIVE</span>{me && <div className="pixel-frame item-slot px-2 py-1 flex items-center gap-2"><img src={me.avatar_url ?? "/icons/icon-192.png"} alt="" className="w-6 h-6 pixel-frame border border-dv-line" /><span className="text-[8px] text-dv-brassLight max-w-[70px] truncate">{me.username}</span></div>}<button type="button" aria-label="Open settings" onClick={() => router.push("/settings")} className="pixel-frame item-slot border border-dv-line px-3 py-2 text-[10px] shadow-pixel-sm hover:border-dv-violet">⚙️</button></div>
        </div>
      </header>

      <main className="min-h-screen px-4 pt-6 pb-24 max-w-2xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-5"><div><p className="eyebrow">CYCLE STARTED {cycleStartISO}</p><h2 className="text-xl sm:text-2xl text-dv-brassLight mt-2">KEEP THE GUILD<br className="sm:hidden" /> ON PACE.</h2></div><div className="text-right shrink-0"><p className="text-[8px] text-slate-300/50">CURRENT DAY</p><p className="text-2xl text-dv-emerald">D{dayNumber}</p></div></div>
        <WyvernTracker current={settings.wyvern_element as any} setBy={settings.wyvern_set_by} onSelect={setWyvern} />
        <LogAttackButton anchorDate={settings.anchor_date} resetHour={settings.reset_hour_utc} dayNumber={dayNumber} loggedDays={myLoggedDays} onLog={logAttack} />
        <GuildProgress members={members} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={pingMissing} pinging={pinging} />
        {toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pixel-frame bg-dv-brass text-dv-bg text-[9px] px-4 py-3 shadow-pixel animate-rise">{toast}</div>}
      </main>
    </>
  );
}
