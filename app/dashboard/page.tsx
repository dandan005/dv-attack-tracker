"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { WyvernTracker } from "@/components/WyvernTracker";
import { ExplorationPhase } from "@/components/ExplorationPhase";
import { Guide, Meals, Runes } from "@/components/OperationsLibrary";

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

type Tab = "ledger" | "guide" | "meals" | "runes" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "ledger", label: "Ledger" },
  { id: "guide", label: "Guide" },
  { id: "meals", label: "Meals" },
  { id: "runes", label: "Runes" },
  { id: "settings", label: "Settings" },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ledger");
  const [settings, setSettings] = useState<Settings>({ anchor_date: "2026-01-05", reset_hour_utc: 0, wyvern_element: null, wyvern_set_by: null });
  const [myLoggedDays, setMyLoggedDays] = useState<number[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentMember | null>(null);
  const [settingsDraft, setSettingsDraft] = useState({ anchor_date: "2026-01-05", reset_hour_utc: 0 });

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
    setSettingsDraft({ anchor_date: currentSettings.anchor_date, reset_hour_utc: currentSettings.reset_hour_utc });
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

  async function saveCycleSettings() {
    const anchor_date = settingsDraft.anchor_date || "2026-01-05";
    const reset_hour_utc = Math.min(23, Math.max(0, Number(settingsDraft.reset_hour_utc) || 0));
    const { error } = await supabase.from("app_settings").update({ anchor_date, reset_hour_utc }).eq("id", 1);
    if (error) {
      setToast("Error: " + error.message);
    } else {
      await loadAll();
      setToast("Cycle settings saved");
    }
    setTimeout(() => setToast(null), 2500);
  }

  const dayIndex = Math.min(5, Math.max(0, dayNumber - 1));
  const cycleDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const phases = ["Match", "Explore", "Explore", "Raid", "Raid", "Raid"];

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[11px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p></main>;

  return (
    <div className="scanlines min-h-screen">
      <header className="sticky top-0 z-40 border-b border-dv-line bg-dv-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => setTab("ledger")} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-dv-brass bg-dv-brass font-pixel text-[11px] text-dv-bg shadow-pixel-sm">DV</span>
            <span className="text-left"><span className="eyebrow block">DRAGON VALLEY // GUILD HUB</span><span className="block text-sm text-dv-brassLight">ATTACK LEDGER</span></span>
          </button>
          <div className="flex items-center gap-2">
            {me && <div className="pixel-frame item-slot flex items-center gap-2 px-2 py-1"><img src={me.avatar_url ?? "/icons/icon-192.png"} alt="" className="h-6 w-6 pixel-frame border border-dv-line" /><span className="max-w-[90px] truncate text-[10px] text-dv-brassLight">{me.username}</span></div>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 md:pb-20 md:pt-7">
        {tab === "ledger" && (
          <>
            <div className="mb-5"><p className="eyebrow text-dv-emerald">GUILD OPERATIONS / ONLINE</p><h1 className="mt-1 text-2xl text-dv-brassLight sm:text-3xl">GUILD HUB</h1><p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200/60">The live raid ledger for the current six-day cycle.</p></div>

            <section className="pixel-border overflow-hidden bg-dv-panel/95 shadow-pixel">
              <div className="flex items-center justify-between border-b border-dv-line px-4 py-3"><div><p className="eyebrow mb-2">CURRENT SEASON CLOCK</p><p className="text-[11px]">CYCLE START {cycleStartISO} <span className="text-slate-300/50">/ DAY {dayNumber} OF 6</span></p></div><span className="status-chip">{cycleDays[dayIndex]} / LIVE</span></div>
              <div className="grid grid-cols-6 gap-px bg-dv-line">
                {[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={"bg-dv-panel px-1 py-3 text-center " + (day === dayNumber ? "bg-dv-violet/15" : "")}><p className={"text-[9px] " + (day < dayNumber ? "text-dv-emerald" : day === dayNumber ? "text-dv-brassLight" : "text-slate-300/55")}>D{day}</p><div className={"mx-auto my-2 h-2 w-2 " + (day < dayNumber ? "bg-dv-emerald" : day === dayNumber ? "bg-dv-brass" : "border border-dv-line")} /><p className="text-[9px] text-slate-300/60">{phases[day - 1]}</p></div>)}
              </div>
              <p className="border-t border-dv-line px-4 py-2 text-[9px] text-slate-300/60">◆ {dayNumber < 4 ? "Exploration is active; use all three entries before raid prep." : "Raid window is live; keep every attack on the shared ledger."}</p>
            </section>

            {(dayNumber < 3 || settings.wyvern_element) && <div className="mt-4">{dayNumber < 3 ? <ExplorationPhase currentDay={dayNumber} /> : <WyvernTracker current={settings.wyvern_element as any} setBy={settings.wyvern_set_by} onSelect={setWyvern} />}</div>}

            <div className="mt-4"><LogAttackButton anchorDate={settings.anchor_date} resetHour={settings.reset_hour_utc} dayNumber={dayNumber} loggedDays={myLoggedDays} onLog={logAttack} /></div>
            <div className="mt-4"><GuildProgress members={members} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={pingMissing} pinging={pinging} /></div>
          </>
        )}

        {tab === "guide" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">FIELD GUIDE</p>
            <Guide />
          </section>
        )}

        {tab === "meals" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">SEASON MEALS</p>
            <Meals />
          </section>
        )}

        {tab === "runes" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">RUNE DESK</p>
            <Runes />
          </section>
        )}

        {tab === "settings" && (
          <section>
            <div className="mb-4"><p className="eyebrow text-dv-emerald">GUILD SETTINGS</p><h2 className="mt-1 text-xl text-dv-brassLight">Keep the shared clock accurate.</h2></div>
            <section className="pixel-border bg-dv-panel/95 p-4 shadow-pixel">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-[10px] text-dv-brassLight">CYCLE ANCHOR DATE<input type="date" value={settingsDraft.anchor_date} onChange={(event) => setSettingsDraft((current) => ({ ...current, anchor_date: event.target.value }))} className="mt-2 w-full pixel-frame item-slot border border-dv-line px-3 py-3 text-[11px] text-dv-brassLight outline-none focus:border-dv-violet" /><span className="mt-2 block text-[9px] text-slate-300/45">Day 1 of the first raid cycle.</span></label>
                <label className="text-[10px] text-dv-brassLight">RESET HOUR (UTC)<input type="number" min={0} max={23} value={settingsDraft.reset_hour_utc} onChange={(event) => setSettingsDraft((current) => ({ ...current, reset_hour_utc: Number(event.target.value) }))} className="mt-2 w-full pixel-frame item-slot border border-dv-line px-3 py-3 text-[11px] text-dv-brassLight outline-none focus:border-dv-violet" /><span className="mt-2 block text-[9px] text-slate-300/45">Hour 0–23 UTC when the attack log rolls over.</span></label>
              </div>
              <button type="button" onClick={saveCycleSettings} className="mt-5 w-full pixel-frame bg-dv-brass px-4 py-3 text-[11px] text-dv-bg shadow-pixel-sm hover:bg-dv-brassLight active:translate-y-[2px]">SAVE CYCLE SETTINGS</button>
            </section>
          </section>
        )}

        {toast && <div role="status" className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 pixel-frame bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel animate-rise">{toast}</div>}
      </main>

      <nav
        aria-label="Guild hub sections"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-dv-line bg-dv-bg/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl justify-around px-2 py-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={
                "flex flex-1 flex-col items-center gap-1 border px-1 py-1.5 text-[9px] uppercase tracking-[.1em] " +
                (tab === id
                  ? "border-dv-brass text-dv-brassLight"
                  : "border-transparent text-slate-300/55 hover:border-dv-line hover:text-dv-brassLight")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
