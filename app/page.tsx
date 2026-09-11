"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SplashPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md space-y-4 animate-rise">
        <div className="pixel-frame pixel-border bg-dv-panel p-5 sm:p-7 shadow-pixel">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="brand-mark">DV</div>
            <span className="status-chip"><span className="w-1.5 h-1.5 rounded-full bg-dv-emerald" /> RAID HUB // ONLINE</span>
          </div>

          <p className="eyebrow mb-3">GUILD HUB</p>
          <h1 className="text-2xl sm:text-3xl text-dv-brassLight leading-tight">DRAGON<br />VALLEY</h1>
          <p className="text-[11px] leading-relaxed text-slate-300/70 mt-4 max-w-xs">
            Keep every attack on the board. Stay ahead of reset. Make the guild stronger one day at a time.
          </p>

          <div className="soft-divider my-6" />

          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              ["06", "DAY CYCLE"],
              ["D1–D6", "ATTACK LOG"],
              ["24/7", "REMINDERS"],
            ].map(([value, label]) => (
              <div key={label} className="item-slot p-3 text-center">
                <div className="text-[12px] text-dv-brassLight">{value}</div>
                <div className="text-[9px] text-slate-300/60 mt-2">{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full pixel-frame bg-dv-brass disabled:opacity-60 text-dv-bg text-[11px] py-3.5 shadow-pixel-sm active:translate-y-[2px] flex items-center justify-center gap-2 hover:bg-dv-brassLight transition-colors"
          >
            {loading ? "CONNECTING..." : <><DiscordMark /> ENTER WITH DISCORD</>}
          </button>

          <p className="text-[10px] text-slate-300/45 mt-5 text-center tracking-wide">
            PRIVATE GUILD ACCESS // DISCORD AUTHENTICATION
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-300/60">
          <div className="pixel-frame border border-dv-line bg-dv-panel/80 p-3">⚔ LOG YOUR RUNS</div>
          <div className="pixel-frame border border-dv-line bg-dv-panel/80 p-3 text-right">◈ SEE THE RAID FLOW</div>
        </div>
      </div>
    </main>
  );
}

function DiscordMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}
