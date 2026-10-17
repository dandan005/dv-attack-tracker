"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo, getDay7Phase, formatCountdown } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { WyvernTracker } from "@/components/WyvernTracker";
import { ExplorationPhase } from "@/components/ExplorationPhase";
import { Guide, MainCooking, Meals, Runes, SkillBuild, Spirits } from "@/components/OperationsLibrary";
import { DragonCrest } from "@/components/DragonCrest";
import { LedgerIcon, GuideIcon, BuildIcon, CookingIcon, SpecialIcon, RunesIcon, SettingsIcon, ReplayIcon } from "@/components/TabIcons";
import { Walkthrough } from "@/components/Walkthrough";
import { rankByTier } from "@/lib/ranks";
import { SettingsPopup } from "@/components/SettingsPopup";

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
  guild_verified_at: string | null;
};

type AttackLog = {
  member_id: string;
  day_number: number;
  logged_at?: string;
};

type Tab = "ledger" | "index" | "build" | "cooking" | "special" | "runes" | "settings";

const TABS: { id: Tab; label: string; icon: ((props: { className?: string }) => JSX.Element) | string }[] = [
  { id: "ledger", label: "Ledger", icon: LedgerIcon },
  { id: "index", label: "Index", icon: GuideIcon },
  { id: "build", label: "Build", icon: BuildIcon },
  { id: "cooking", label: "Cooking", icon: CookingIcon },
  { id: "special", label: "Special", icon: SpecialIcon },
  { id: "runes", label: "Runes", icon: RunesIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
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
  useEffect(() => { document.querySelector("main")?.scrollTo(0, 0); }, [tab]);
  const [settings, setSettings] = useState<Settings>({ wyvern_element: null, wyvern_set_by: null });
  const [showSettings, setShowSettings] = useState(false);
  const [myLoggedDays, setMyLoggedDays] = useState<number[]>([]);
  const [myCleanRuns, setMyCleanRuns] = useState(0);
  const [myLoggedAt, setMyLoggedAt] = useState<Record<number, string>>({});
  const [myTier, setMyTier] = useState<number | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isSuper, setIsSuper] = useState(false);
  const [myGuildId, setMyGuildId] = useState<number | null>(null);
  const [guildView, setGuildView] = useState<string>("");
  const [guildList, setGuildList] = useState<{ id: number; code: string }[]>([]);
  const effView = guildView || (myGuildId !== null ? String(myGuildId) : "ALL");
  const shownMembers = isSuper && effView !== "ALL" ? members.filter((m) => String(m.guild_id) === effView) : members;
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentMember | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { dayNumber, cycleStartISO } = getCycleInfo();
  const day7 = getDay7Phase(now);

  const visibleTabs = TABS.filter((t) => t.id !== "settings");

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

    const { data: allMembers } = await supabase.from("members").select("id, auth_user_id, discord_id, username, avatar_url, is_admin, has_seen_walkthrough, promotion_tier, guild_verified_at, guild_id, is_super_admin");
    const { data: logsData } = await supabase.from("attack_logs").select("member_id, day_number, logged_at").eq("cycle_start", cycle.cycleStartISO);
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
        promotion_tier: member.promotion_tier ?? null,
        guild_id: member.guild_id ?? null,
      };
    });
    setMembers([...rows].sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" })));

    const myRow = (allMembers ?? []).find((member: any) => member.auth_user_id === user.id);
    if (myRow) {
      const myLogs = logsByMember.get(myRow.id) ?? new Map<number, AttackLog>();
      setMyLoggedDays(CYCLE_DAY_NUMBERS.filter((day) => myLogs.has(day)));
      const { data: myAll } = await supabase.from("attack_logs").select("cycle_start, day_number").eq("member_id", myRow.id);
      const byCycle = new Map<string, Set<number>>();
      (myAll ?? []).forEach((l: any) => { if (!byCycle.has(l.cycle_start)) byCycle.set(l.cycle_start, new Set()); byCycle.get(l.cycle_start)!.add(l.day_number); });
      setMyCleanRuns(Array.from(byCycle.values()).filter((d) => CYCLE_DAY_NUMBERS.every((n) => d.has(n))).length);
      setMyLoggedAt(Object.fromEntries(CYCLE_DAY_NUMBERS.filter((day) => myLogs.has(day)).map((day) => [day, myLogs.get(day)?.logged_at ?? ""])));
      setMyTier(myRow.promotion_tier ?? null);
      setIsSuper(!!myRow.is_super_admin);
      setMyGuildId(myRow.guild_id ?? null);
      if (myRow.is_super_admin) fetch("/api/assign-guild").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setGuildList(d.guilds); }).catch(() => {});
      setMe({
        username: myRow.username,
        avatar_url: myRow.avatar_url,
        discord_id: myRow.discord_id,
        is_admin: myRow.is_admin,
        has_seen_walkthrough: myRow.has_seen_walkthrough,
        guild_verified_at: myRow.guild_verified_at ?? null,
      });
      if (!myRow.has_seen_walkthrough) setShowWalkthrough(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Realtime auto-sync: refetch whenever attack logs or settings change,
  // so all members see updates live without manually refreshing.
  // `syncing` drives a brief visual indicator in the header.
  useEffect(() => {
    const channel = supabase
      .channel("guild-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attack_logs" },
        () => {
          setSyncing(true);
          loadAll().finally(() => setTimeout(() => setSyncing(false), 800));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          setSyncing(true);
          loadAll().finally(() => setTimeout(() => setSyncing(false), 800));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveTier(value: string) { const tier = Number(value); if (!value || !Number.isInteger(tier)) return; const res = await fetch("/api/set-tier", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promotionTier: tier }) }); if (res.ok) { setMyTier(tier); await loadAll(); setToast("Rank set to " + (rankByTier(tier)?.name ?? "T" + tier)); } else { setToast("Could not save promotion tier"); } setTimeout(() => setToast(null), 2500); }
  async function logAttack(day: number, _cycle?: string, damage?: number | null) {
    const res = await fetch("/api/log-attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber: day, promotionTier: myTier, damageScore: damage ?? null }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Could not log attack");
    }
      setToast("D" + day + " attack logged ⚔️");
      await loadAll();
      setTimeout(() => setToast(null), 2500);
    }

  async function pingMissing() {
    setPinging(true);
    try {
      const res = await fetch("/api/ping-missing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guild: isSuper ? (effView === "ALL" ? "ALL" : Number(effView)) : undefined }) });
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

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3">
        <span className="text-2xl text-dv-violet animate-rune-active" aria-hidden="true">ᛏ</span>
        <p className="text-[11px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p>
      </main>
    );
  }

  // Split into "missed some days" (mild warning) vs "logged zero attacks
  // all cycle" (severe warning — next cycle's zero means expulsion).
  const zeroLoggedMembers = members.filter((m) => m.logged.every((logged) => !logged));
  const partiallyLoggedMembers = members.filter(
    (m) => m.logged.some((logged) => logged) && m.logged.some((logged) => !logged)
  );

  return (
    <div className="scanlines fixed inset-0 flex flex-col overflow-hidden">
      <header className="z-40 shrink-0 border-b border-dv-line bg-dv-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => setTab("ledger")} className="flex items-center gap-3">
            <DragonCrest />
            <span className="text-left"><span className="eyebrow block whitespace-nowrap leading-none">DRAGON VALLEY</span><span className="block whitespace-nowrap text-xs leading-none text-dv-brassLight">ATTACK</span><span className="block whitespace-nowrap text-xs leading-none text-dv-brassLight">LEDGER</span></span>
          </button>
          <div className="flex items-center gap-2">
            {syncing && (
              <div className="pixel-frame item-slot flex items-center gap-1.5 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-dv-emerald animate-pulse" />
                <span className="text-[9px] text-dv-emerald">SYNCING</span>
              </div>
            )}
          {me && <SettingsPopup open={showSettings} onClose={() => setShowSettings(false)} me={{ ...me, promotion_tier: myTier, guild_verified_at: me.guild_verified_at ?? null }} stats={{ loggedThisCycle: myLoggedDays.length, cleanRuns: myCleanRuns, cycleRate: members.length === 0 ? 0 : Math.round((members.reduce((s, m) => s + m.logged.filter(Boolean).length, 0) / (members.length * Math.max(dayNumber, 1))) * 100) }} onReplayWalkthrough={() => { setShowSettings(false); setShowWalkthrough(true); }} onSetTier={(t) => saveTier(String(t))} onSignOut={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} />}
            {me && (
              <div onClick={() => setShowSettings(true)} role="button" aria-label="Open settings" className="pixel-frame item-slot flex cursor-pointer items-center gap-2 px-2 py-1">
                <img src={me.avatar_url || "/icons/icon-192.png"}
                  alt=""
                  className="h-6 w-6 shrink-0 aspect-square pixel-frame border border-dv-line object-cover"
                  style={{ objectFit: "cover" }}
                  />
                <span className="whitespace-nowrap text-[10px] text-dv-brassLight">{me.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-5 sm:px-6 md:pt-7">
        {tab === "ledger" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-1">
              <p className="eyebrow text-dv-emerald">ᛏ GUILD OPERATIONS / ONLINE</p>
              <section className="pixel-border bg-dv-panel/95 shadow-pixel mt-4 p-4">
              <div className="relative inline-block">
                <h1 className="mt-1 text-lg text-dv-brassLight">GUILD HUB</h1>
              </div>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200/60">The live raid ledger for the current seven-day cycle. Track every attack, see who has checked in each day, and keep an eye on the Wyvern boss element locked for this raid.</p>
              </section>
            </div>

            {day7.phase === "calculation" ? (
              <div className="relative mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <span className="absolute top-2 right-3 text-dv-violet/40 text-xs" aria-hidden="true">ᛗ</span>
                <span className="absolute top-2 left-3 text-dv-violet/40 text-xs" aria-hidden="true">ᚦ</span>
                <p className="text-sm text-dv-brassLight">⚙️ RANKING CALCULATION IN PROGRESS</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Dragon Valley ranking is being calculated now. You will receive rewards based on the results after calculating is finished.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Until calculation complete: {day7.hoursLeft}h left</p>

                {(zeroLoggedMembers.length > 0 || partiallyLoggedMembers.length > 0) && (
                  <div className="mt-5 w-full max-w-md space-y-4 text-left">
                    {zeroLoggedMembers.length > 0 && (
                      <div>
                        <p className="eyebrow text-dv-ember">🚨 ZERO ATTACKS LOGGED — EXPULSION RISK</p>
                        <ul className="mt-2 space-y-1.5">
                          {zeroLoggedMembers.map((m) => (
                            <li
                              key={m.discord_id}
                              className="item-slot flex items-center justify-between border border-dv-ember/60 bg-dv-ember/10 px-3 py-2"
                            >
                              <span className="flex items-center gap-2 text-[10px] text-slate-200/80">
                                <img
                                  src={m.avatar_url ?? "/icons/icon-192.png"}
                                  alt=""
                                  className="h-5 w-5 pixel-frame border border-dv-line object-cover"
                                />
                                {m.username}
                              </span>
                              <span className="text-[10px] text-dv-ember">0/6 logged</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[9px] leading-relaxed text-dv-ember/80">
                          No attacks logged this entire cycle. Log at least one attack next cycle or you will be expelled from the guild.
                        </p>
                      </div>
                    )}

                    {zeroLoggedMembers.length > 0 && partiallyLoggedMembers.length > 0 && (
                      <div className="soft-divider flex items-center justify-center">
                        <span className="-mt-2 bg-dv-panel px-2 text-dv-violet/50 text-[10px]" aria-hidden="true">ᛒ</span>
                      </div>
                    )}

                    {partiallyLoggedMembers.length > 0 && (
                      <div>
                        <p className="eyebrow text-dv-brass">⚠️ MISSED ATTACKS THIS CYCLE</p>
                        <ul className="mt-2 space-y-1.5">
                          {partiallyLoggedMembers.map((m) => (
                            <li
                              key={m.discord_id}
                              className="item-slot flex items-center justify-between border border-dv-line px-3 py-2"
                            >
                              <span className="flex items-center gap-2 text-[10px] text-slate-200/75">
                                <img
                                  src={m.avatar_url ?? "/icons/icon-192.png"}
                                  alt=""
                                  className="h-5 w-5 pixel-frame border border-dv-line object-cover"
                                />
                                {m.username}
                              </span>
                              <span className="text-[10px] text-dv-brassLight">
                                {m.logged.filter(Boolean).length}/6 logged
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[9px] leading-relaxed text-slate-300/50">
                          A few attacks were missed — try to log every day next cycle.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : day7.phase === "ranking-results" ? (
              <div className="relative mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <span className="absolute top-2 right-3 text-dv-brass/40 text-xs" aria-hidden="true">ᛃ</span>
                <span className="absolute top-2 left-3 text-dv-brass/40 text-xs" aria-hidden="true">ᛉ</span>
                <p className="text-sm text-dv-brassLight">🏆 RANKING RESULTS</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Ranking has been finalized. Rewards are being distributed now — check your in-game mailbox shortly.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Distribution ends in: {day7.minutesLeft}m</p>
              </div>
            ) : day7.phase === "onboarding" ? (
              <div className="relative mt-4 flex min-h-0 flex-1 flex-col items-center justify-center pixel-border bg-dv-panel/95 p-5 text-center shadow-pixel">
                <span className="absolute top-2 right-3 text-dv-emerald/40 text-xs" aria-hidden="true">ᚱ</span>
                <span className="absolute top-2 left-3 text-dv-emerald/40 text-xs" aria-hidden="true">ᚨ</span>
                <p className="text-sm text-dv-brassLight">🛸 ONBOARDING — PREPARING NEXT CYCLE</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-200/60">
                  Rewards have been distributed. Rest up and regear.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Day 1 opens in: {formatCountdown(day7.msLeft)}</p>
              </div>
            ) : (
              <>
                {(dayNumber < 3 || (dayNumber >= 3 && dayNumber <= 6 && settings.wyvern_element)) && (
                  <div className="mt-2">
                    {dayNumber < 3 ? (
                      <ExplorationPhase currentDay={dayNumber} />
                    ) : (
                      <WyvernTracker
                        current={settings.wyvern_element as any}
                        setBy={settings.wyvern_set_by}
                        onSelect={setWyvern}
                        isAdmin={me?.is_admin ?? false}
                      />
                    )}
                  </div>
                )}

                <div className="mt-3"><LogAttackButton loggedDays={myLoggedDays} loggedAt={myLoggedAt} element={settings.wyvern_element} checkedIn={members.filter((m) => m.logged[dayNumber - 1]).length} total={dayNumber <= 6 ? members.length : 0} tier={myTier} onNeedTier={() => { setToast("Set your rank in the ledger row next to your name"); setTimeout(() => setToast(null), 2500); }} onLog={logAttack} /></div>
                <div className="mt-3"><GuildProgress headerExtra={isSuper && guildList.length > 0 && (<div className="mb-2 flex gap-2">{["ALL", ...guildList.map((g) => String(g.id))].map((v) => { const g = guildList.find((x) => String(x.id) === v); return (<button key={v} type="button" onClick={() => setGuildView(v)} className={["h-6 border px-2 text-[9px]", v === effView ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/80"].join(" ")} style={v === effView ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>{g ? g.code : "ALL"}</button>); })}</div>)} members={shownMembers} onSetTier={saveTier} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={pingMissing} pinging={pinging} /></div>
              </>
            )}
          </div>
        )}

        {tab === "index" && (<section><p className="eyebrow mb-4 text-dv-emerald">ᛒ OPERATIONS INDEX</p><Guide /></section>)}
        {tab === "build" && (
          <section className="space-y-3">
            <div>
              <p className="eyebrow mb-4 text-dv-emerald">ᚨ BUILD GUIDE</p>
              <SkillBuild />
            </div>
            <div>
              <Spirits />
            </div>
            <div>
            </div>
          </section>
        )}

{tab === "cooking" && (<section><p className="eyebrow mb-4 text-dv-emerald">ᛒ MAIN COOKING</p><MainCooking /></section>)}{tab === "special" && (<section><p className="eyebrow mb-4 text-dv-emerald">ᛊ SPECIAL DISH</p><Meals /></section>)}

        {tab === "runes" && (
          <section>
            <p className="eyebrow mb-4 text-dv-emerald">ᛃ RUNE DESK</p>
            <Runes />
          </section>
        )}


        {toast && <div role="status" className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 pixel-frame bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel animate-rise">{toast}</div>}
      </main>

      <nav
        aria-label="Guild hub sections"
        className="z-40 shrink-0 border-t border-dv-line bg-dv-bg/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-md justify-around px-2 py-2">
          {visibleTabs.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={
                "relative flex flex-1 flex-col items-center gap-1 px-1 py-1.5 text-[9px] uppercase tracking-[.1em] " +
                (tab === id
                  ? "text-dv-brassLight"
                  : "text-slate-300/55 hover:text-dv-brassLight")
              }
            >
              {tab === id && (
                <>
                  <span className="rune-sparkle" style={{ top: "10%", left: "15%", animationDelay: "0s" }} />
                  <span className="rune-sparkle--sm rune-sparkle" style={{ top: "20%", left: "70%", animationDelay: "0.4s" }} />
                  <span className="rune-sparkle" style={{ top: "55%", left: "8%", animationDelay: "0.9s" }} />
                  <span className="rune-sparkle--sm rune-sparkle" style={{ top: "65%", left: "85%", animationDelay: "1.3s" }} />
                  <span className="rune-sparkle" style={{ top: "80%", left: "40%", animationDelay: "0.2s" }} />
                  <span className="rune-sparkle--sm rune-sparkle" style={{ top: "15%", left: "45%", animationDelay: "1.6s" }} />
                  <span className="rune-sparkle" style={{ top: "40%", left: "90%", animationDelay: "0.7s" }} />
                  <span className="rune-sparkle--sm rune-sparkle" style={{ top: "75%", left: "20%", animationDelay: "1.0s" }} />
                  <span className="rune-sparkle" style={{ top: "30%", left: "25%", animationDelay: "1.8s" }} />
                  <span className="rune-sparkle--sm rune-sparkle" style={{ top: "5%", left: "60%", animationDelay: "0.55s" }} />
                </>
              )}
              <span
                key={`${id}-${tab === id}`}
                className={"text-base leading-none" + (tab === id ? " animate-rune-active" : "")}
              >
                {typeof icon === "string" ? icon : icon({})}
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <Walkthrough open={showWalkthrough} onClose={closeWalkthrough} />
    </div>
  );
}
