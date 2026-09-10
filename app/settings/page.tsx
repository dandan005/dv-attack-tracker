"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PixelPanel, PixelHeader } from "@/components/PixelPanel";

type Settings = {
  anchor_date: string;
  reset_hour_utc: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({ anchor_date: "2026-01-05", reset_hour_utc: 0 });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      const { data: settingsRow } = await supabase.from("app_settings").select("anchor_date, reset_hour_utc").eq("id", 1).single();
      if (settingsRow) setSettings({ anchor_date: settingsRow.anchor_date, reset_hour_utc: settingsRow.reset_hour_utc });
      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings() {
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({ anchor_date: settings.anchor_date, reset_hour_utc: settings.reset_hour_utc }).eq("id", 1);
    setSaving(false);
    setToast(error ? "Error: " + error.message : "Cycle settings saved");
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[11px] text-dv-brassLight animate-blink">LOADING SETTINGS...</p></main>;

  return (
    <>
      <header className="sticky top-0 z-50 px-4 py-3 bg-dv-bg/90 backdrop-blur-md border-b border-dv-line">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div><p className="eyebrow">DRAGON VALLEY // ADMIN</p><h1 className="text-[12px] text-dv-brassLight mt-1">CYCLE SETTINGS</h1></div>
          <button type="button" onClick={() => router.push("/dashboard")} className="pixel-frame item-slot border border-dv-line px-3 py-2 text-[10px] text-dv-brassLight shadow-pixel-sm hover:border-dv-violet">← BACK TO BOARD</button>
        </div>
      </header>

      <main className="min-h-screen px-4 pt-6 pb-24 max-w-2xl mx-auto">
        <PixelPanel className="animate-rise">
          <PixelHeader icon="⚙️" title="RAID CYCLE CONFIG" right={<span className="text-[10px] text-dv-bg/70">GUILD-WIDE</span>} />
          <p className="text-[10px] leading-relaxed text-slate-300/60 mb-5">These values keep every member on the same six-day rhythm, no matter where they are playing from.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] text-dv-brassLight mb-2 tracking-widest" htmlFor="anchor-date">CYCLE ANCHOR DATE</label>
              <input id="anchor-date" type="date" value={settings.anchor_date} onChange={(e) => setSettings((current) => ({ ...current, anchor_date: e.target.value }))} className="w-full pixel-frame item-slot border border-dv-line px-3 py-3 text-[11px] text-dv-brassLight focus:border-dv-violet outline-none" />
              <p className="text-[10px] text-slate-300/45 mt-2">Day 1 of the first raid cycle. Used to calculate the current cycle day.</p>
            </div>

            <div>
              <label className="block text-[10px] text-dv-brassLight mb-2 tracking-widest" htmlFor="reset-hour">RESET HOUR (UTC)</label>
              <input id="reset-hour" type="number" min={0} max={23} value={settings.reset_hour_utc} onChange={(e) => setSettings((current) => ({ ...current, reset_hour_utc: Number(e.target.value) }))} className="w-full pixel-frame item-slot border border-dv-line px-3 py-3 text-[11px] text-dv-brassLight focus:border-dv-violet outline-none" />
              <p className="text-[10px] text-slate-300/45 mt-2">Hour 0–23 UTC when the attack log rolls over to the next day.</p>
            </div>

            <div className="soft-divider" />
            <button type="button" onClick={saveSettings} disabled={saving} className="w-full pixel-frame bg-dv-brass hover:bg-dv-brassLight border border-dv-brassLight px-4 py-3 text-[11px] text-dv-bg shadow-pixel-sm disabled:opacity-50 active:translate-y-[2px]">{saving ? "SAVING..." : "SAVE CYCLE SETTINGS"}</button>
          </div>
        </PixelPanel>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] text-slate-300/50">
          <div className="item-slot p-3"><span className="text-dv-violet">◆</span> ONE SHARED CLOCK</div>
          <div className="item-slot p-3 text-right"><span className="text-dv-emerald">✓</span> SIX DAY RHYTHM</div>
        </div>

        {toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pixel-frame bg-dv-brass text-dv-bg text-[10px] px-4 py-3 shadow-pixel animate-rise">{toast}</div>}
      </main>
    </>
  );
}
