"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo, getDay7Phase } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { WyvernTracker } from "@/components/WyvernTracker";
import { ExplorationPhase } from "@/components/ExplorationPhase";
import { Guide, MainCooking, Meals, Runes, SkillBuild, Spirits } from "@/components/OperationsLibrary";
import { DragonCrest } from "@/components/DragonCrest";
import { Walkthrough } from "@/components/Walkthrough";

type Settings = {
  wyvern_element: string | null;
  wyvern_set_by: string | null;
};

type CurrentMember = {
  username: string;
  avatar_url: string | null;
  discord_id: string;
  is_admin: boolean;
  has_seen_walkthrough: boolean;
};

type AttackLog = {
  member_id: string;
  day_number: number;
};

type Tab = "ledger" | "guide" | "meals" | "runes" | "settings";
type MealsSubTab = "main" | "special";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "ledger", label: "Ledger", icon: "⚔️" },
  { id: "guide", label: "Guide", icon: "📖" },
  { id: "meals", label: "Meals", icon: "🍖" },
  { id: "runes", label: "Runes", icon: "🔮" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

// Day 7 is standby — no attacks are ever logged that day, and it's fully
// covered by the three getDay7Phase phases (calculation, ranking-results,
// onboarding), so it's excluded here to keep the guild readout limited to
// the 6 days attacks can actually happen.
const CYCLE_DAY_NUMBERS = [1, 2, 3, 4, 5, 6];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ledger");
  const [mealsSubTab, setMealsSubTab] = useState<MealsSubTab>("main");
  const [settings, setSettings] = useState<Settings>({ wyvern_element: null, wyvern_set_by: null });
  const [myLoggedDays, setMyLoggedDays] = useState<number[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentMember | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const { dayNumber, cycleStartISO } = getCycleInfo();
  const day7 = getDay7Phase(now);

  const visibleTabs = TABS.filter((t) => t.id !== "settings" || me?.is_admin);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const settingsResponse = await fetch("/api/settings", { cache: "no-store" });
    const settingsRow = settingsResponse.ok ? await settingsResponse.json() : null;
    const currentSettings: Settings = {
      wyvern_element: settingsRow?.wyvern_element ?? null,
      wyvern_set_by: settingsRow?.wyvern_set_by ?? null,
    };
    setSettings(currentSettings);
    const cycle = getCycleInfo();

    const { data: allMembers } = await supabase.from("members").select("id, auth_user_id, discord_id, username, avatar_url, is_admin, has_seen_walkthrough");
    const { data: logsData } = await supabase.from("attack_logs").select("member_id, day_number").eq("cycle_start", cycle.cycleStartISO);
    const logs: AttackLog[] = logsData ?? [];

    const logsByMember = new Map<string, Map<number, AttackLog>>();
    logs.forEach((log) => {
      if (!logsByMember.has(log.member_id)) logsByMember.set(log.member_id, new Map());
      logsByMember.get(log.member_id)!.set(log.day_number, log);
    });

    const rows: MemberRow[] = (allMembers ?? []).map((member: any) => {
      const memberLogs = logsByMember.get(member.id) ?? new Map<number, AttackLog>();
      return {
        discord_id: member.discord_id,
        username: member.username,
        avatar_url: member.avatar_url,
        logged: CYCLE_DAY_NUMBERS.map((day) => memberLogs.has(day)),
      };
    });
    setMembers(rows);

    const myRow = (allMembers ?? []).find((member: any) => member.auth_user_id === user.id);
    if (myRow) {
      const myLogs = logsByMember.get(myRow.id) ?? new Map<number, AttackLog>();
      setMyLoggedDays(CYCLE_DAY_NUMBERS.filter((day) => myLogs.has(day)));
      setMe({
        username: myRow.username,
        avatar_url: myRow.avatar_url,
        discord_id: myRow.discord_id,
        is_admin: myRow.is_admin,
        has_seen_walkthrough: myRow.has_seen_walkthrough,
      });
      if (!myRow.has_seen_walkthrough) setShowWalkthrough(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function logAttack(day: number) {
    const res = await fetch("/api/log-attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber: day }),
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
    try {
      const res = await fetch("/api/ping-missing", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      setToast(res.ok ? "Pinged " + json.missing + " member(s) on Discord" : (json.error ?? "Could not ping missing members"));
    } catch {
      setToast("Could not ping missing members");
    } finally {
      setPinging(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function setWyvern(element: "wind" | "fire" | "earth" | "water") {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wyvern_element: element }),
    });
    if (!response.ok) {
      setToast("Could not update guild settings");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setSettings((current) => ({ ...current, wyvern_element: element, wyvern_set_by: me?.username ?? null }));
    setToast("Wyvern trace set to " + element.toUpperCase());
    setTimeout(() => setToast(null), 2500);
  }


  async function closeWalkthrough() {
    setShowWalkthrough(false);
    if (me && !me.has_seen_walkthrough) {
      setMe({ ...me, has_seen_walkthrough: true });
      await fetch("/api/settings", { method: "POST" }).catch(() => {});
    }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[11px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p></main>;

  return (
    <div className="scanlines fixed inset-0 flex flex-col overflow-hidden">
      <header className="z-40 shrink-0 border-b border-dv-line bg-dv-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => setTab("ledger")} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center">
              <DragonCrest />
            </span>
            <span className="text-left"><span className="eyebrow block">DRAGON VALLEY</span><span className="block text-sm text-dv-brassLight">ATTACK LEDGER</span></span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWalkthrough(true)}
              aria-label="Replay walkthrough"
              className="pixel-frame item-slot grid h-8 w-8 place-items-center text-dv-brassLight"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M20 12a8 8 0 1 1-2.34-5.66"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 4v5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M10 9.3v5.4l4.5-2.7-4.5-2.7z" fill="currentColor" />
              </svg>
            </button>
            {me && (
              <div className="pixel-frame item-slot flex items-center gap-2 px-2 py-1">
                <img src={me.avatar_url ?? "/icons/icon-192.png"}
                  alt=""
                  className="h-6 w-6 pixel-frame border border-dv-line object-cover"
                  style={{ objectFit: "cover" }}
                  />
                <span className="whitespace-nowrap text-[10px] text-dv-brassLight">{me.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-5 sm:px-6 md:pt-7">
        {tab === "ledger" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-5"><p className="eyebrow text-dv-emerald">GUILD OPERATIONS / ONLINE</p><h1 className="mt-1 text-2xl text-dv-brassLight sm:text-3xl">GUILD HUB</h1><p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200/60">The live raid ledger for the current seven-day cycle.</p></div>

            {day7.phase === "calculation" ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <p className="text-sm text-dv-brassLight">⚙️ RANKING CALCULATION IN PROGRESS</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Dragon Valley ranking is being calculated now. You will receive rewards based on the results after calculating is finished.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Until calculation complete: {day7.hoursLeft}h left</p>
              </div>
            ) : day7.phase === "ranking-results" ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <p className="text-sm text-dv-brassLight">🏆 RANKING RESULTS</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Ranking has been finalized. Rewards are being distributed now — check your in-game mailbox shortly.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Distribution ends in: {day7.minutesLeft}m</p>
              </div>
            ) : day7.phase === "onboarding" ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <p className="text-sm text-dv-brassLight">🛸 ONBOARDING — PREPARING NEXT CYCLE</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Rewards have been distributed. Rest up and regear.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Day 1 opens in: {day7.hoursLeft}h left</p>
              </div>
            ) : (
              <>
                {(dayNumber < 3 || settings.wyvern_element) && <div className="mt-4">{dayNumber < 3 ? <ExplorationPhase currentDay={dayNumber} /> : <WyvernTracker current={settings.wyvern_element as any} setBy={settings.wyvern_set_by} onSelect={setWyvern} isAdmin={me?.is_admin ?? false} />}</div>}

                <div className="mt-4"><LogAttackButton anchorDate={settings.anchor_date} resetHour={settings.reset_hour_utc} dayNumber={dayNumber} loggedDays={myLoggedDays} onLog={logAttack} /></div>
                <div className="mt-4"><GuildProgress members={members} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={pingMissing} pinging={pinging} /></div>
              </>
            )}
          </div>
        )}

        {tab === "guide" && (
          <section className="space-y-6">
            <div>
              <p className="eyebrow mb-4 text-dv-emerald">SKILL BUILD</p>
              <SkillBuild />
            </div>
            <div>
              <p className="eyebrow mb-4 text-dv-emerald">SPIRITS</p>
              <Spirits />
            </div>
            <div>
              <p className="eyebrow mb-4 text-dv-emerald">FIELD GUIDE</p>
              <Guide />
            </div>
          </section>
        )}

        {tab === "meals" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">SEASON MEALS</p>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMealsSubTab("main")}
                className={
                  "border px-3 py-2.5 text-center text-[10px] uppercase tracking-[.06em] " +
                  (mealsSubTab === "main"
                    ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight"
                    : "border-dv-line bg-dv-panel2 text-slate-300/60")
                }
              >
                Main Cooking
              </button>
              <button
                type="button"
                onClick={() => setMealsSubTab("special")}
                className={
                  "border px-3 py-2.5 text-center text-[10px] uppercase tracking-[.06em] " +
                  (mealsSubTab === "special"
                    ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight"
                    : "border-dv-line bg-dv-panel2 text-slate-300/60")
                }
              >
                Special Dish
              </button>
            </div>

            {mealsSubTab === "main" ? <MainCooking /> : <Meals />}
          </section>
        )}

        {tab === "runes" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">RUNE DESK</p>
            <Runes />
          </section>
        )}

        {tab === "settings" && me?.is_admin && (
          <section>
            <div className="mb-5"><p className="eyebrow text-dv-emerald">GUILD SETTINGS</p><h2 className="mt-1 text-xl text-dv-brassLight">Configure the parts the guild actually uses.</h2><p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-200/60">The raid clock is fixed to the in-game schedule, so there is no anchor date to maintain. Use this panel for the shared raid signal, reminders, and field briefing.</p></div>

            <WyvernTracker current={settings.wyvern_element as any} setBy={settings.wyvern_set_by} onSelect={setWyvern} isAdmin={me?.is_admin ?? false} />

            <section className="pixel-border bg-dv-panel/95 p-4 shadow-pixel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow text-dv-violet">DISCORD REMINDERS</p>
                  <h3 className="mt-1 text-base text-dv-brassLight">Ping members missing today&apos;s attack</h3>
                  <p className="mt-2 max-w-xl text-[10px] leading-relaxed text-slate-200/55">Send a reminder to the guild members who have not logged their attack for the current day. This uses the configured Discord webhook.</p>
                </div>
                <button type="button" onClick={pingMissing} disabled={pinging} className="pixel-frame shrink-0 bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel-sm hover:bg-dv-brassLight active:translate-y-[2px] disabled:cursor-wait disabled:opacity-60">{pinging ? "PINGING..." : "PING MISSING MEMBERS"}</button>
              </div>
            </section>

            <section className="mt-4 pixel-border bg-dv-panel/95 p-4 shadow-pixel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow text-dv-emerald">RAID CLOCK</p>
                  <h3 className="mt-1 text-base text-dv-brassLight">Fixed to the Dragon Valley schedule</h3>
                </div>
                <button type="button" onClick={() => setShowWalkthrough(true)} className="pixel-frame border border-dv-violet px-3 py-2 text-[9px] text-dv-violet hover:bg-dv-violet/10">REPLAY FIELD BRIEFING</button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="item-slot border border-dv-line px-3 py-3"><p className="text-[9px] text-slate-300/45">DAY 1 START</p><p className="mt-1 text-[10px] text-dv-brassLight">MON 14:00 UTC · MON 10:00 PM PHT</p></div>
                <div className="item-slot border border-dv-line px-3 py-3"><p className="text-[9px] text-slate-300/45">ATTACK WINDOW</p><p className="mt-1 text-[10px] text-dv-brassLight">D1–D6 · 6 ATTACK DAYS</p></div>
                <div className="item-slot border border-dv-line px-3 py-3"><p className="text-[9px] text-slate-300/45">DAY 7</p><p className="mt-1 text-[10px] text-dv-brassLight">STANDBY · RESULTS · ONBOARDING</p></div>
                <div className="item-slot border border-dv-line px-3 py-3"><p className="text-[9px] text-slate-300/45">REMINDER MODE</p><p className="mt-1 text-[10px] text-dv-brassLight">MANUAL + VERCEL CRON</p></div>
              </div>
            </section>
          </section>
        )}

        {toast && <div role="status" className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 pixel-frame bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel animate-rise">{toast}</div>}
      </main>

      <nav
        aria-label="Guild hub sections"
        className="z-40 shrink-0 border-t border-dv-line bg-dv-bg/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl justify-around px-2 py-2">
          {visibleTabs.map(({ id, label, icon }) => (
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
              <span className="text-base leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <Walkthrough open={showWalkthrough} onClose={closeWalkthrough} />
    </div>
  );
}
