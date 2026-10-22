"use client";
import { PlayerList } from "@/components/PlayerList";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { RankPicker } from "./RankPicker";
import { ProfileFields } from "./ProfileFields";
import { rankByTier, rankImg } from "@/lib/ranks";

export type SettingsMe = {
  username: string;
  avatar_url: string | null;
  discord_id: string;
  promotion_tier: number | null;
  guild_verified_at: string | null;
  is_admin: boolean;
};

export type SettingsStats = {
  loggedThisCycle: number;
  cleanRuns: number;
  cycleRate: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  me: SettingsMe;
  stats: SettingsStats;
  onSetTier: (tier: number) => void;
  onReplayWalkthrough?: () => void;
  onSignOut: () => void;
  onAdminResetCycle?: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-[9px] tracking-[0.25em] text-dv-brassLight/80">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dv-line bg-black/20 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[10px] tracking-[0.15em] text-slate-200/80">{label}</div>
        {value && <div className="text-[9px] text-slate-300/50 break-words">{value}</div>}
      </div>
      {children}
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-dv-line bg-black/20 px-2 py-2 text-center">
      <div className={`text-base ${tone}`}>{value}</div>
      <div className="mt-1 text-[8px] tracking-[0.15em] text-slate-300/60">{label}</div>
    </div>
  );
}

export function SettingsPopup({
  open,
  onClose,
  me,
  stats,
  onSetTier,
  onReplayWalkthrough,
  onSignOut,
  onAdminResetCycle,
}: Props) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const rank = rankByTier(me.promotion_tier);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setConfirmSignOut(false);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar w-full max-w-sm rounded-xl border border-dv-line bg-dv-panel2"
        style={{ maxHeight: "calc(100dvh - 130px)", overflowY: "auto", touchAction: "pan-y" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dv-line bg-dv-panel2 px-4 py-3">
          <span className="text-[11px] tracking-[0.25em] text-dv-brassLight">SETTINGS</span>
          <button onClick={onClose} aria-label="Close settings" className="px-2 text-sm text-slate-200/80">
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={me.avatar_url || "/icons/icon-192.png"}
              alt=""
              className="h-14 w-14 rounded-lg border border-dv-brassLight/60 object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-sm tracking-[0.1em] text-dv-brassLight">{me.username}</div>
              <div className="text-[9px] tracking-[0.15em] text-slate-300/50">ID {me.discord_id}</div>
              {me.guild_verified_at ? (
                <div className="mt-1 inline-block rounded-full border border-dv-emerald px-2 py-0.5 text-[8px] tracking-[0.15em] text-dv-emerald">
                  GUILD VERIFIED
                </div>
              ) : (
                <div className="mt-1 inline-block rounded-full border border-slate-400/40 px-2 py-0.5 text-[8px] tracking-[0.15em] text-slate-300/60">
                  NOT VERIFIED
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <StatTile label="LOGGED" value={`${stats.loggedThisCycle}/6`} tone="text-dv-emerald" />
            <StatTile label="CLEAN RUNS" value={String(stats.cleanRuns)} tone="text-dv-brassLight" />
            <StatTile label="CYCLE RATE" value={`${stats.cycleRate}%`} tone="text-dv-brassLight" />
          </div>

          <Section title="PROFILE">
            <Row label="Rank" value={rank ? "Shown to the guild in the ledger" : "Not set yet"}>
              <RankPicker tier={me.promotion_tier ?? null} onSelect={(t) => onSetTier(t)} />
            </Row>
            {rank && (
              <Row label={rank.name}>
                <img src={rankImg(rank.file)} alt="" className="h-6 w-6" />
              </Row>
            )}
          </Section>

          <Section title="PLAYER STATS"><ProfileFields Row={Row} /></Section>

          <Section title="HELP">
            {onReplayWalkthrough && (
              <Row label="Replay walkthrough" value="Shows the intro again next time">
                <button onClick={onReplayWalkthrough} className="rounded-md border border-dv-brassLight/60 px-3 py-1 text-[9px] tracking-[0.15em] text-dv-brassLight">
                  PLAY
                </button>
              </Row>
            )}
            <Row label="Exit app" value="Close Dragon Valley">
              <button
                onClick={() => {
                  if (!window.confirm("Exit Dragon Valley?")) return;
                  window.close();
                  setTimeout(() => alert("If the app is still open, swipe it away from recent apps."), 600);
                }}
                className="rounded-md border border-dv-ember/70 px-3 py-1 text-[9px] tracking-[0.15em] text-dv-ember"
              >
                EXIT
              </button>
            </Row>
          </Section>

          {me.is_admin && (<Section title="RAID SCHEDULE"><Row label="Day 1 start" value="Mon 14:00 UTC · Mon 10:00 PM PHT" /><Row label="Attack window" value="D1–D6 · 6 attack days" /><Row label="Day 7" value="Standby · Results · Onboarding" /><Row label="Reminder mode" value="Manual + cron-job.org" /></Section>)}
        {me.is_admin && (<Section title="PLAYERS"><PlayerList /></Section>)}

          <Section title="ACCOUNT">
            <Row label="Sign out" value={confirmSignOut ? "Tap again to confirm" : "You will need to sign in again"}>
              <button
                onClick={() => (confirmSignOut ? onSignOut() : setConfirmSignOut(true))}
                className="rounded-md border border-red-400/60 px-3 py-1 text-[9px] tracking-[0.15em] text-red-300"
              >
                {confirmSignOut ? "CONFIRM" : "SIGN OUT"}
              </button>
            </Row>
          </Section>
        </div>
      </div>
    </div>,
    document.body
  );
}
