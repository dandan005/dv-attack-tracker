"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo } from "@/lib/cycle";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AttackLog } from "@/components/AttackLog";
import { GuildProgress, MemberRow } from "@/components/GuildProgress";

type Settings = { anchor_date: string; reset_hour_utc: number };

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    anchor_date: "2026-01-05",
    reset_hour_utc: 0,
  });
  const [myLoggedDays, setMyLoggedDays] = useState<number[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { dayNumber, cycleStartISO } = getCycleInfo(
    settings.anchor_date,
    settings.reset_hour_utc
  );

  async function loadAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const { data: settingsRow } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single();
    const currentSettings: Settings = settingsRow ?? {
      anchor_date: "2026-01-05",
      reset_hour_utc: 0,
    };
    setSettings(currentSettings);
    const cycle = getCycleInfo(currentSettings.anchor_date, currentSettings.reset_hour_utc);

    const { data: allMembers } = await supabase
      .from("members")
      .select("id, auth_user_id, discord_id, username, avatar_url");

    const { data: logs } = await supabase
      .from("attack_logs")
      .select("member_id, day_number")
      .eq("cycle_start", cycle.cycleStartISO);

    const logsByMember = new Map<string, Set<number>>();
    (logs ?? []).forEach((l: any) => {
      if (!logsByMember.has(l.member_id)) logsByMember.set(l.member_id, new Set());
      logsByMember.get(l.member_id)!.add(l.day_number);
    });

    const rows: MemberRow[] = (allMembers ?? []).map((m: any) => ({
      discord_id: m.discord_id,
      username: m.username,
      avatar_url: m.avatar_url,
      logged: [1, 2, 3, 4, 5, 6].map((d) => logsByMember.get(m.id)?.has(d) ?? false),
    }));
    setMembers(rows);

    const me = (allMembers ?? []).find((m: any) => m.auth_user_id === user.id);
    if (me) {
      setMyLoggedDays([1, 2, 3, 4, 5, 6].filter((d) => logsByMember.get(me.id)?.has(d)));
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
      setToast(`D${day} attack logged ⚔️`);
      await loadAll();
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function pingMissing() {
    setPinging(true);
    const res = await fetch("/api/ping-missing", { method: "POST" });
    const json = await res.json();
    setPinging(false);
    setToast(res.ok ? `Pinged ${json.missing} member(s) on Discord` : json.error);
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[10px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xs sm:text-sm text-dv-emerald">DRAGON VALLEY</h1>
          <p className="text-[9px] text-dv-brassLight">ATTACK TRACKER</p>
        </div>
        <button
          onClick={() => router.push("/settings")}
          className="pixel-frame bg-dv-panel2 border border-dv-brass px-3 py-2 text-[10px] shadow-pixel-sm"
        >
          ⚙️
        </button>
      </header>

      <CountdownTimer
        anchorDate={settings.anchor_date}
        resetHour={settings.reset_hour_utc}
        dayNumber={dayNumber}
      />

      <AttackLog loggedDays={myLoggedDays} currentDay={dayNumber} onLog={logAttack} />

      <GuildProgress members={members} onPingMissing={pingMissing} pinging={pinging} />

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pixel-frame bg-dv-ember text-dv-bg text-[9px] px-4 py-3 shadow-pixel animate-rise">
          {toast}
        </div>
      )}
    </main>
  );
}
