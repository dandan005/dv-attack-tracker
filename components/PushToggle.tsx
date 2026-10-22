"use client";
import { useEffect, useState } from "react";

type State = "loading" | "off" | "on" | "denied" | "unsupported";

function b64ToBytes(s: string) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Day reminders on this device. Works on Android Chrome; iPhone needs the app added to the home screen.
export default function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? "on" : "off");
    })().catch(() => setState("off"));
  }, []);

  async function enable() {
    setBusy(true);
    setErr("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setState(perm === "denied" ? "denied" : "off");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const { key } = await (await fetch("/api/push/key", { cache: "no-store" })).json();
      if (!key) throw new Error("Notifications are not set up yet.");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
      const res = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error("Could not save. Try again.");
      setState("on");
    } catch (e: any) {
      setErr(e?.message || "Could not turn on notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setErr("");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setErr("Could not turn off. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const msg: Record<State, string> = {
    loading: "Checking...",
    on: "On for this device",
    off: "Day start and last-call reminders",
    denied: "Blocked in browser settings",
    unsupported: "Not supported here. On iPhone, add the app to your home screen first.",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.1em] text-dv-brassLight">Notifications</p>
        <p className="mt-0.5 text-[9px] text-slate-300/60">{msg[state]}</p>
        {err && <p className="mt-1 text-[9px] text-rose-300">{err}</p>}
      </div>
      {(state === "off" || state === "on") && (
        <button
          type="button"
          disabled={busy}
          onClick={() => (state === "on" ? disable() : enable())}
          className="shrink-0 rounded-md border border-dv-brassLight/60 px-3 py-1 text-[9px] tracking-[0.15em] text-dv-brassLight disabled:opacity-50"
        >
          {busy ? "..." : state === "on" ? "TURN OFF" : "TURN ON"}
        </button>
      )}
    </div>
  );
}
