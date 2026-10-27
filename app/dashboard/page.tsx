"use client";
import { avatarSrc } from "@/lib/avatarSrc";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo, getDay7Phase, formatCountdown } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";
import { RankingCard } from "@/components/RankingCard";
import { WyvernTracker, WYVERN_LOCATION } from "@/components/WyvernTracker";
import { ExplorationPhase } from "@/components/ExplorationPhase";
import { Guide, MainCooking, Meals, Runes, SkillBuild, Spirits } from "@/components/OperationsLibrary";
import { DragonCrest } from "@/components/DragonCrest";
import { LedgerIcon, RankingIcon, GuideIcon, CookingIcon, SpecialIcon, RunesIcon, AssignIcon, SettingsIcon, ReplayIcon } from "@/components/TabIcons";
import AssignCard from "@/components/AssignCard";
import { clientLog } from "@/lib/clientLog";
import { Walkthrough } from "@/components/Walkthrough";
import { TermsAgreement } from "@/components/TermsAgreement";
import { TERMS_VERSION } from "@/lib/terms";
import { rankByTier } from "@/lib/ranks";
import { SettingsPopup } from "@/components/SettingsPopup";

type Settings = {
  wyvern_element: string | null;
  wyvern_set_by: string | null;
};

type CurrentMember = {
  id: string;
  is_super_admin?: boolean;
  is_creator?: boolean;
  username: string;
  avatar_url: string | null;
  discord_id: string;
  is_admin: boolean;
  has_seen_walkthrough: boolean;
  terms_version: string | null;
  guild_verified_at: string | null;
};

type AttackLog = {
  member_id: string;
  day_number: number;
  logged_at?: string;
  logged_by?: string | null;
};

type Tab = "ledger" | "index" | "build" | "cooking" | "special" | "runes" | "assign" | "settings";

const TABS: { id: Tab; label: string; icon: ((props: { className?: string }) => JSX.Element) | string }[] = [
  { id: "ledger", label: "Ledger", icon: LedgerIcon },
  { id: "index", label: "Ranking", icon: RankingIcon },
  { id: "assign", label: "Assign", icon: AssignIcon },
  { id: "build", label: "Guide", icon: GuideIcon },
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
  const [canReadout, setCanReadout] = useState(false);
  const [myGuildId, setMyGuildId] = useState<number | null>(null);
  const [guildView, setGuildView] = useState<string>("");
  const [guildList, setGuildList] = useState<{ id: number; code: string }[]>([]);
  const effView = guildView || (isSuper ? "ALL" : myGuildId !== null ? String(myGuildId) : "ALL");
  const shownMembers = isSuper && effView === "ALL" ? members : members.filter((m) => String(m.guild_id) === effView);
  const [rosterCounts, setRosterCounts] = useState<Record<string, number>>({});
  const [rankMembers, setRankMembers] = useState<any[]>([]);
  const [assignRoles, setAssignRoles] = useState<any>(null);
  const assignStartup = useMemo(() => (assignRoles ? { members: rankMembers, roles: assignRoles } : null), [assignRoles, rankMembers]);
  const guildSigned = effView === "ALL" ? members.length : members.filter((m) => String(m.guild_id) === effView).length;
  const guildTotal = effView === "ALL" ? (rosterCounts["1"] ?? 0) + (rosterCounts["2"] ?? 0) : (rosterCounts[effView] ?? 0);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentMember | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsMode, setTermsMode] = useState<"accept" | "read">("accept");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { dayNumber, cycleStartISO } = getCycleInfo();
  const day7 = getDay7Phase(now);

  const visibleTabs = TABS.filter((t) => t.id !== "settings" && t.id !== "index" && (t.id !== "assign" || canReadout));

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

    const { data: allMembers } = await supabase.from("members").select("id, auth_user_id, discord_id, username, game_name, avatar_url, custom_avatar, custom_avatar_url, is_admin, has_seen_walkthrough, terms_version, promotion_tier, guild_verified_at, guild_id, is_super_admin, is_creator, level, stage");
    const { data: logsData } = await supabase.from("attack_logs").select("member_id, day_number, logged_at, logged_by").eq("cycle_start", cycle.cycleStartISO);
    const logs: AttackLog[] = logsData ?? [];

    const logsByMember = new Map<string, Map<number, AttackLog>>();
    logs.forEach((log) => {
      if (!logsByMember.has(log.member_id)) logsByMember.set(log.member_id, new Map());
      logsByMember.get(log.member_id)!.set(log.day_number, log);
    });

    const rows: MemberRow[] = (allMembers ?? []).map((member: any) => {
      const memberLogs = logsByMember.get(member.id) ?? new Map<number, AttackLog>();
      return {
        id: member.id,
        discord_id: member.discord_id,
        username: member.game_name || member.username,
        avatar_url: member.avatar_url,
        custom_avatar: member.custom_avatar ?? null,
        custom_avatar_url: member.custom_avatar_url ?? null,
        logged: CYCLE_DAY_NUMBERS.map((day) => memberLogs.has(day)),
        byAdmin: CYCLE_DAY_NUMBERS.map((day) => !!memberLogs.get(day)?.logged_by),
        promotion_tier: member.promotion_tier ?? null,
        guild_id: member.guild_id ?? null,
        stage: member.stage ?? null,
        level: member.level ?? null,
      };
    });
    setMembers([...rows].sort((a, b) => (b.promotion_tier ?? 0) - (a.promotion_tier ?? 0) || (b.stage ?? -1) - (a.stage ?? -1) || (b.level ?? -1) - (a.level ?? -1)));
    const rankingReq = fetch("/api/ranking?guild=ALL").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d?.members) return;
      setRankMembers(d.members);
      const c: Record<string, number> = {};
      for (const m of d.members) { if (m.guild_id != null) { const k = String(m.guild_id); c[k] = (c[k] ?? 0) + 1; } }
      setRosterCounts(c);
    }).catch(() => {});

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
      setCanReadout(!!(myRow.is_creator || myRow.is_admin || myRow.is_super_admin));
      setAssignRoles({ is_creator: !!myRow.is_creator, is_admin: !!myRow.is_admin, is_super_admin: !!myRow.is_super_admin, guild_id: myRow.guild_id ?? null, me: myRow.id });
      setMyGuildId(myRow.guild_id ?? null);
      if (myRow.is_super_admin) fetch("/api/assign-guild").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setGuildList(d.guilds); }).catch(() => {});
      setMe({
        id: myRow.id,
        username: myRow.username,
        avatar_url: myRow.avatar_url,
        discord_id: myRow.discord_id,
        is_admin: myRow.is_admin,
        is_super_admin: !!myRow.is_super_admin,
        is_creator: !!myRow.is_creator,
        has_seen_walkthrough: myRow.has_seen_walkthrough,
        terms_version: myRow.terms_version ?? null,
        guild_verified_at: myRow.guild_verified_at ?? null,
      });
      if (myRow.terms_version !== TERMS_VERSION) {
        setTermsMode("accept");
        setShowTerms(true);
      } else if (!myRow.has_seen_walkthrough) {
        setShowWalkthrough(true);
      }
    }
    await rankingReq;
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
      const e: any = new Error(json.error ?? "Could not log attack");
      e.status = res.status;
      throw e;
    }
      setToast("D" + day + " attack logged ⚔️");
      await loadAll();
      setTimeout(() => setToast(null), 2500);
    }

  const markingRef = useRef<Set<string>>(new Set());

  const [savingMarks, setSavingMarks] = useState<Record<string, boolean>>({});

  async function markAttack(memberId: string, day: number, done: boolean) {
    const key = memberId + ":" + day;
    if (markingRef.current.has(key)) return;
    markingRef.current.add(key);
    setSavingMarks((m) => ({ ...m, [key]: true }));
    try {
      const res = await fetch("/api/mark-attack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId, dayNumber: day, done }) });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        clientLog("mark-attack", json.error ?? "Could not update", { status: res.status, day });
        alert(json.error ?? "Could not update");
        return;
      }
      await loadAll();
    } catch {
      clientLog("mark-attack", "Network error", { day });
      alert("Network error, try again");
    } finally {
      markingRef.current.delete(key);
      setSavingMarks((m) => { const n = { ...m }; delete n[key]; return n; });
    }
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


  async function acceptTerms() {
    const res = await fetch("/api/accept-terms", { method: "POST" });
    if (!res.ok) throw new Error("save failed");
    setMe((m) => (m ? { ...m, terms_version: TERMS_VERSION } : m));
    setShowTerms(false);
    if (me && !me.has_seen_walkthrough) setShowWalkthrough(true);
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
  const perfectMembers = members.filter((m) => m.logged.length > 0 && m.logged.every(Boolean));

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
          {me && <SettingsPopup open={showSettings} onClose={() => setShowSettings(false)} onReadTerms={() => { setTermsMode("read"); setShowTerms(true); }} me={{ ...me, promotion_tier: myTier, guild_verified_at: me.guild_verified_at ?? null }} stats={{ loggedThisCycle: myLoggedDays.length, cleanRuns: myCleanRuns, cycleRate: members.length === 0 ? 0 : Math.round((members.reduce((s, m) => s + m.logged.filter(Boolean).length, 0) / (members.length * Math.max(dayNumber, 1))) * 100) }} onReplayWalkthrough={() => { setShowSettings(false); setShowWalkthrough(true); }} onSetTier={(t) => saveTier(String(t))} onSignOut={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} />}
            <button type="button" onClick={() => setTab("index")} aria-label="Open Ranking" title="Ranking" className={"pixel-frame item-slot flex h-8 w-8 shrink-0 items-center justify-center " + (tab === "index" ? "text-white" : "text-dv-brassLight")} aria-current={tab === "index" ? "page" : undefined}>
              <RankingIcon className="h-4 w-4" />
            </button>
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
          <div className="flex flex-1 flex-col">
            {day7.phase !== "calculation" && day7.phase !== "ranking-results" && day7.phase !== "onboarding" && (
            <div className="mb-1">
              <p className="eyebrow text-dv-emerald">ᛏ GUILD OPERATIONS / ONLINE</p>
            </div>
            )}

            {day7.phase === "calculation" ? (
              <div className="relative flex flex-col items-center justify-start pixel-border bg-dv-panel/95 px-5 pt-2 pb-8 text-center shadow-pixel">
                <span className="absolute top-2 right-3 text-dv-violet/40 text-xs" aria-hidden="true">ᛗ</span>
                <span className="absolute top-2 left-3 text-dv-violet/40 text-xs" aria-hidden="true">ᚦ</span>
                <p className="text-sm text-dv-brassLight">⚙️ RANKING CALCULATION IN PROGRESS</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#fdf3dc]">
                  Dragon Valley ranking is being calculated now. You will receive rewards based on the results after calculating is finished.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Until calculation complete: {day7.hoursLeft}h left</p>

                {(zeroLoggedMembers.length > 0 || partiallyLoggedMembers.length > 0 || perfectMembers.length > 0) && (
                  <div className="mt-5 w-full max-w-md space-y-4 text-left">
                    {perfectMembers.length > 0 && (
                      <div>
                        <p className="eyebrow text-dv-emerald">✅ PERFECT RUNS THIS CYCLE</p>
                        <ul className="mt-2 space-y-1.5">
                          {perfectMembers.map((m) => (
                            <li key={m.discord_id} className="item-slot flex items-center justify-between border border-dv-line px-3 py-2">
                              <span className="flex items-center gap-2 text-[10px] text-[#fdf3dc]">
                                <img src={avatarSrc(m)} alt="" className="h-5 w-5 pixel-frame border border-dv-line object-cover" />
                                {m.username}
                              </span>
                              <span className="text-[10px] text-dv-emerald">6/6 logged</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[9px] leading-relaxed text-[#fdf3dc]">Perfect runs this cycle — every attack logged. Keep it up next cycle.</p>
                      </div>
                    )}
                    {zeroLoggedMembers.length > 0 && perfectMembers.length > 0 && (
                      <div className="soft-divider flex items-center justify-center">
                        <span className="-mt-2 bg-dv-panel px-2 text-dv-violet/50 text-[10px]" aria-hidden="true">ᛒ</span>
                      </div>
                    )}
                    {zeroLoggedMembers.length > 0 && (
                      <div>
                        <p className="eyebrow text-dv-ember">🚨 ZERO ATTACKS LOGGED — EXPULSION RISK</p>
                        <ul className="mt-2 space-y-1.5">
                          {zeroLoggedMembers.map((m) => (
                            <li
                              key={m.discord_id}
                              className="item-slot flex items-center justify-between border border-dv-ember/60 bg-dv-ember/10 px-3 py-2"
                            >
                              <span className="flex items-center gap-2 text-[10px] text-[#fdf3dc]">
                                <img
                                  src={avatarSrc(m)}
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
                    {(zeroLoggedMembers.length > 0 || perfectMembers.length > 0) && partiallyLoggedMembers.length > 0 && (
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
                              <span className="flex items-center gap-2 text-[10px] text-[#fdf3dc]">
                                <img
                                  src={avatarSrc(m)}
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
                        <p className="mt-2 text-[9px] leading-relaxed text-[#fdf3dc]">
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
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#fdf3dc]">
                  Ranking has been finalized. Rewards are being distributed now — check your in-game mailbox shortly.
                </p>
                <p className="mt-2 text-xs text-dv-emerald">Distribution ends in: {day7.minutesLeft}m</p>
              </div>
            ) : day7.phase === "onboarding" ? (
              <div className="relative mt-0 flex flex-1 flex-col items-center pixel-border bg-dv-panel/95 px-5 pt-3 pb-6 text-center shadow-pixel">
                <span className="absolute top-2 right-3 text-dv-emerald/40 text-xs" aria-hidden="true">ᚱ</span>
                <span className="absolute top-2 left-3 text-dv-emerald/40 text-xs" aria-hidden="true">ᚨ</span>
                <p className="text-sm text-dv-brassLight">🛸 ONBOARDING — PREPARING NEXT CYCLE</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#fdf3dc]">Rewards have been distributed. Rest up and regear.</p>
                <div className="item-slot mt-4 w-full max-w-md border border-dv-line px-3 py-4">
                  <p className="eyebrow text-center">DAY 1 OPENS IN</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {formatCountdown(day7.msLeft).split(":").map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="item-slot flex w-16 flex-col items-center border border-dv-line py-2">
                          <span className="text-2xl text-dv-emerald">{v}</span>
                          <span className="mt-1 text-[8px] text-dv-brassLight/70">{["HRS", "MIN", "SEC"][i] ?? ""}</span>
                        </div>
                        {i < 2 && <span className="text-2xl text-dv-emerald/60">:</span>}
                      </div>
                    ))}
                  </div>
                  <div className="item-slot mt-4 h-2.5 w-full overflow-hidden border border-dv-line">
                    <div className="h-full bg-dv-emerald" style={{ width: Math.max(0, Math.min(100, (1 - day7.msLeft / 50400000) * 100)) + "%" }} />
                  </div>
                  <p className="mt-1 text-center text-[8px] text-[#fdf3dc]">ONBOARDING PROGRESS</p>
                </div>
                <div className="mt-5 w-full max-w-md text-left">
                  <p className="eyebrow text-dv-emerald">GET READY</p>
                  <ul className="mt-2 space-y-1.5">
                    {[["Check your assignment", "Confirm your DV map in the Assign tab."], ["Learn the cooking order", "Cooking opens on Days 1–3. Study the priority order in the Cooking tab."], ["Know what to gather", "Ingredients come in on Days 1–3. The Special tab shows what each meal needs."], ["Review the guide", "Skim the Guide tab before your first run."]].map(([ttl, d]) => (
                      <li key={ttl} className="item-slot border border-dv-line px-3 py-2">
                        <p className="text-[10px] text-[#fdf3dc]">{ttl}</p>
                        <p className="mt-0.5 text-[9px] text-[#fdf3dc]">{d}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 w-full max-w-md text-left">
                  <p className="eyebrow text-dv-emerald">CYCLE TIMELINE</p>
                  <ul className="mt-2 space-y-1.5">
                    {[["D1–D6", "Attack days. Log every run."], ["D7", "Ranking calculation."], ["D7", "Rewards distributed."], ["NOW", "Onboarding. Prepare the next cycle."]].map(([a1, b1], idx) => (
                      <li key={idx} className={"item-slot flex items-center gap-3 border px-3 py-2 " + (idx === 3 ? "border-dv-emerald" : "border-dv-line opacity-60")}>
                        <span className={"w-12 shrink-0 text-[9px] " + (idx === 3 ? "text-dv-emerald" : "text-dv-brassLight")}>{a1}</span>
                        <span className="text-[10px] text-[#fdf3dc]">{b1}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {dayNumber >= 4 && dayNumber <= 6 && settings.wyvern_element && (() => { const loc = WYVERN_LOCATION[settings.wyvern_element]; return (<section className="pixel-border bg-dv-panel/95 shadow-pixel p-4 mt-2"><p className="eyebrow mb-2">ASSIGNMENT / LOCATION</p><h2 className="text-lg text-dv-brassLight">{"Dragon Valley: " + loc}</h2><p className="mt-2 max-w-xl text-xs leading-relaxed text-[#fdf3dc]">A valley where dragons have lived since long ago.</p></section>); })()}
                {(dayNumber < 4 || (dayNumber >= 4 && dayNumber <= 6 && settings.wyvern_element)) && (
                  <div className="mt-2">
                    {dayNumber < 4 ? (
                      <ExplorationPhase currentDay={dayNumber} guildId={myGuildId} meId={me?.id ?? null} rankMembers={rankMembers} />
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
                <div className="mt-3"><GuildProgress showReadout={canReadout} headerExtra={isSuper && guildList.length > 0 && (<div className="mb-2 flex gap-2">{["ALL", ...guildList.map((g) => String(g.id))].map((v) => { const g = guildList.find((x) => String(x.id) === v); return (<button key={v} type="button" onClick={() => setGuildView(v)} className={["h-6 flex-1 border px-2 text-[9px]", v === effView ? "border-dv-brass bg-black/40 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-[#fdf3dc]"].join(" ")} style={v === effView ? { boxShadow: "0 0 10px rgba(212,175,90,0.5)" } : undefined}>{g ? g.code : "ALL"}</button>); })}</div>)} members={shownMembers} guildStats={{ signed: guildSigned, total: guildTotal }} onMark={canReadout ? markAttack : undefined} onSetTier={saveTier} currentDay={dayNumber} currentUserId={me?.discord_id} onPingMissing={canReadout ? pingMissing : undefined} pinging={pinging} savingMarks={savingMarks} /></div>
              </>
            )}
          </div>
        )}

        {tab === "index" && (<section><p className="eyebrow mb-4 text-dv-emerald">ᛒ RANKING</p><div className="space-y-4"><section className="pixel-border bg-dv-panel/95 shadow-pixel p-4"><p className="eyebrow mb-2">RANKING / LEADERBOARD</p><h2 className="text-lg text-dv-brassLight">Know the board.</h2><p className="mt-2 max-w-xl text-xs leading-relaxed text-[#fdf3dc]">Players are ranked by rank tier first, then stage, then level. Switch between GLOBAL, G1 and G2 to see everyone or a single guild.</p></section><RankingCard /></div></section>)}
        {tab === "build" && (
          <section className="space-y-3">
            <div>
              <p className="eyebrow mb-4 text-dv-emerald">ᚨ GUIDE</p>
              <SkillBuild />
            </div>
            <div>
              <Spirits /></div><div><p className="eyebrow mb-4 text-dv-emerald">ᛒ OPERATIONS INDEX</p><Guide /></div>
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
        {tab === "assign" && (<section><p className="eyebrow mb-4 text-dv-emerald">ᛃ ASSIGNMENT</p><div className="space-y-4"><section className="pixel-border bg-dv-panel/95 shadow-pixel p-4"><p className="eyebrow mb-2">ASSIGNMENT / ROSTER</p><h2 className="text-lg text-dv-brassLight">Set the roster.</h2><p className="mt-2 max-w-xl text-xs leading-relaxed text-[#fdf3dc]">Pick DV MAPS or GUILD REQUEST, then tap an empty seat or boss slot to add a player. Tap a player in a seat to change or remove them.</p></section><AssignCard startup={assignStartup} /></div></section>)}



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
                  : "text-[#fdf3dc] [@media(hover:hover)]:hover:text-dv-brassLight")
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
      <TermsAgreement open={showTerms} mode={termsMode} onAccept={acceptTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
