"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { WyvernTracker } from "@/components/WyvernTracker";
import { ExplorationPhase } from "@/components/ExplorationPhase";

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


  const dayIndex = Math.min(5, Math.max(0, dayNumber - 1));
  const cycleDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const phases = ["Match", "Explore", "Explore", "Raid", "Raid", "Raid"];
  const todayLogged = members.filter((member) => member.logged[dayNumber - 1]).length;
  const raidScore = members.reduce((sum, member) => sum + member.score, 0);
  const fullCycles = members.filter((member) => member.logged.every(Boolean)).length;

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[11px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p></main>;

  return (
    <div className="scanlines min-h-screen">
      <header className="sticky top-0 z-40 border-b border-dv-line bg-dv-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-dv-brass bg-dv-brass font-pixel text-[11px] text-dv-bg shadow-pixel-sm">DV</span>
            <span><span className="eyebrow block">DRAGON VALLEY // LIVE BOARD</span><span className="block text-sm text-dv-brassLight">ATTACK LEDGER</span></span>
          </a>
          <div className="flex items-center gap-2">
            <span className="status-chip hidden sm:inline-flex">D{dayNumber} ACTIVE</span>
            {me && <div className="pixel-frame item-slot flex items-center gap-2 px-2 py-1"><img src={me.avatar_url ?? "/icons/icon-192.png"} alt="" className="h-6 w-6 pixel-frame border border-dv-line" /><span className="max-w-[90px] truncate text-[10px] text-dv-brassLight">{me.username}</span></div>}
            <button type="button" aria-label="Open settings" onClick={() => router.push("/settings")} className="pixel-frame item-slot border border-dv-line px-3 py-2 text-[11px] shadow-pixel-sm hover:border-dv-violet">⚙️</button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl border-t border-dv-line/70 px-4 py-2 text-[9px] uppercase tracking-[.14em] text-slate-300/50"><span className="text-dv-emerald">ATTACK LEDGER</span><span className="mx-2">/</span> live Supabase log</div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-5 sm:px-6 md:pb-10 md:pt-7">
        <div className="mb-5 flex items-end justify-between gap-3"><div><p className="eyebrow text-dv-emerald">GUILD OPERATIONS / ONLINE</p><h1 className="mt-1 text-2xl text-dv-brassLight sm:text-3xl">ATTACK LEDGER</h1></div><div className="text-right"><p className="text-[9px] uppercase tracking-[.14em] text-slate-300/50">CURRENT DAY</p><p className="text-2xl text-dv-emerald">D{dayNumber}</p></div></div>

        <section className="pixel-border overflow-hidden bg-dv-panel/95 shadow-pixel">
          <div className="flex items-center justify-between border-b border-dv-line px-4 py-3"><div><p className="eyebrow mb-2">CURRENT SEASON CLOCK</p><p className="text-[11px]">CYCLE START {cycleStartISO} <span className="text-slate-300/50">/ DAY {dayNumber} OF 6</span></p></div><span className="status-chip">{cycleDays[dayIndex]} / LIVE</span></div>
          <div className="grid grid-cols-6 gap-px bg-dv-line">
            {[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={"bg-dv-panel px-1 py-3 text-center " + (day === dayNumber ? "bg-dv-violet/15" : "")}><p className={"text-[9px] " + (day < dayNumber ? "text-dv-emerald" : day === dayNumber ? "text-dv-brassLight" : "text-slate-300/55")}>D{day}</p><div className={"mx-auto my-2 h-2 w-2 " + (day < dayNumber ? "bg-dv-emerald" : day === dayNumber ? "bg-dv-brass" : "border border-dv-line")} /><p className="text-[9px] text-slate-300/60">{phases[day - 1]}</p></div>)}
          </div>
          <p className="border-t border-dv-line px-4 py-2 text-[9px] text-slate-300/60">◆ {dayNumber < 4 ? "Exploration is active; use all three entries before raid prep." : "Raid window is live; keep every attack on the shared ledger."}</p>
        </section>

        {(dayNumber < 3 || settings.wyvern_element) && <div className="mt-4">{dayNumber < 3 ? <ExplorationPhase currentDay={dayNumber} /> : <WyvernTracker current={settings.wyvern_element as any} setBy={settings.wyvern_set_by} onSelect={setWyvern} />}</div>}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <section className="pixel-border mb-4 bg-dv-panel/95 p-4 shadow-pixel"><p className="eyebrow mb-2">YOUR RAID LEDGER</p><h2 className="text-lg text-dv-brassLight">Live Supabase attack log</h2><p className="mt-1 text-xs text-slate-200/65">Your entry is shared with the guild and stays tied to the current six-day cycle.</p></section>
            <LogAttackButton anchorDate={settings.anchor_date} resetHour={settings.reset_hour_utc} dayNumber={dayNumber} loggedDays={myLoggedDays} onLog={logAttack} />
          </div>
          <section className="pixel-border relative overflow-hidden bg-dv-panel/95 p-4 shadow-pixel"><p className="eyebrow">FIELD NOTE / DAY {dayNumber}</p><h2 className="mt-1 max-w-[230px] text-xl text-dv-brassLight">Trace hunt is still open.</h2><p className="mt-3 max-w-[290px] text-xs leading-relaxed text-slate-200/65">Use all three exploration entries today. The trace decides which wyvern the raid team can prepare for.</p><p className="mt-5 text-[10px] uppercase text-dv-violet">◆ {dayNumber < 3 ? "3 entries available" : "Trace intel available"}</p></section>
        </div>

        <section className="pixel-border mt-4 bg-dv-panel/95 p-4 shadow-pixel"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow mb-2">GUILD READOUT</p><h2 className="text-lg text-dv-brassLight">Keep the line moving.</h2></div><span className="status-chip">{Math.max(members.length - todayLogged, 0)} pending</span></div><div className="grid grid-cols-3 gap-2"><div className="item-slot p-3"><p className="eyebrow">TODAY</p><p className="mt-1 text-xl text-dv-emerald">{todayLogged}<span className="text-xs text-slate-300/50">/{members.length}</span></p></div><div className="item-slot p-3"><p className="eyebrow">POINTS</p><p className="mt-1 text-xl text-dv-brassLight">{raidScore ? raidScore.toLocaleString() : "—"}</p></div><div className="item-slot p-3"><p className="eyebrow">FULL CYCLES</p><p className="mt-1 text-xl text-dv-brassLight">{fullCycles}</p></div></div></section>

        <div className="mt-4"><GuildProgress members={members} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={pingMissing} pinging={pinging} /></div>
        {toast && <div role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 pixel-frame bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel animate-rise">{toast}</div>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-dv-line bg-dv-panel/95 px-2 py-2 backdrop-blur md:hidden"><a href="/dashboard" className="py-1 text-center text-[8px] uppercase text-dv-brassLight"><span className="mb-1 block text-dv-violet">⚔</span>Board</a><a href="/command-center" className="py-1 text-center text-[8px] uppercase text-slate-300/60"><span className="mb-1 block text-dv-violet">◆</span>Command</a><button type="button" onClick={() => router.push("/settings")} className="py-1 text-center text-[8px] uppercase text-slate-300/60"><span className="mb-1 block text-dv-violet">⚙</span>Settings</button></nav>
    </div>
  );
}