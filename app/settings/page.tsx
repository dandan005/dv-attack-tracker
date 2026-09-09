"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  anchor_date: string;
  reset_hour_utc: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    anchor_date: "2026-01-05",
    reset_hour_utc: 0,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: settingsRow } = await supabase
        .from("app_settings")
        .select("anchor_date, reset_hour_utc")
        .eq("id", 1)
        .single();

      if (settingsRow) {
        setSettings({
          anchor_date: settingsRow.anchor_date,
          reset_hour_utc: settingsRow.reset_hour_utc,
        });
      }

      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings() {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        anchor_date: settings.anchor_date,
        reset_hour_utc: settings.reset_hour_utc,
      })
      .eq("id", 1);

    setSaving(false);
    setToast(error ? `Error: ${error.message}` : "Settings saved");
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[10px] text-dv-brassLight animate-blink">LOADING SETTINGS...</p>
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-4 py-5 bg-dv-bg/95 backdrop-blur-sm border-b border-dv-brass flex items-center justify-between">
        <div>
          <h1 className="text-xs sm:text-sm text-dv-emerald">SETTINGS</h1>
          <p className="text-[9px] text-dv-brassLight">RAID CYCLE CONFIG</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="pixel-frame bg-dv-panel2 border border-dv-brass px-3 py-2 text-[10px] shadow-pixel-sm"
        >
          ← BACK
        </button>
      </header>

      <main className="min-h-screen px-4 pt-5 pb-24 max-w-lg mx-auto">
        <div className="pixel-frame bg-dv-panel border border-dv-brass p-4 space-y-5">
          <div>
            <label className="block text-[9px] text-dv-brassLight mb-2 tracking-widest">
              CYCLE ANCHOR DATE
            </label>
            <input
              type="date"
              value={settings.anchor_date}
              onChange={(e) =>
                setSettings((s) => ({ ...s, anchor_date: e.target.value }))
              }
              className="w-full pixel-frame bg-dv-panel2 border border-dv-brass px-3 py-2 text-[10px] text-dv-brassLight"
            />
            <p className="text-[8px] text-dv-brassLight/60 mt-1">
              Day 1 of the first raid cycle. Used to calculate the current cycle day.
            </p>
          </div>

          <div>
            <label className="block text-[9px] text-dv-brassLight mb-2 tracking-widest">
              RESET HOUR (UTC)
            </label>
            <input
              type="number"
              min={0}
              max={23}
              value={settings.reset_hour_utc}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  reset_hour_utc: Number(e.target.value),
                }))
              }
              className="w-full pixel-frame bg-dv-panel2 border border-dv-brass px-3 py-2 text-[10px] text-dv-brassLight"
            />
            <p className="text-[8px] text-dv-brassLight/60 mt-1">
              Hour (0–23 UTC) each day the attack log resets.
            </p>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full pixel-frame bg-dv-ember border border-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel-sm disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </div>

        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pixel-frame bg-dv-ember text-dv-bg text-[9px] px-4 py-3 shadow-pixel animate-rise">
            {toast}
          </div>
        )}
      </main>
    </>
  );
}
