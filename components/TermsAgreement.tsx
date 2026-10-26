"use client";

import { useState } from "react";
import { PRIVACY, TERMS, TERMS_VERSION, type LegalSection } from "@/lib/terms";

// "accept" blocks the app until the member agrees. "read" is the view opened from Settings.
export function TermsAgreement({
  open,
  mode,
  onAccept,
  onClose,
}: {
  open: boolean;
  mode: "accept" | "read";
  onAccept: () => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const sections: LegalSection[] = tab === "terms" ? TERMS : PRIVACY;

  async function accept() {
    setSaving(true);
    setError(null);
    try {
      await onAccept();
    } catch {
      setError("Could not save your agreement. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true" aria-label="Terms and privacy">
      <div className="pixel-border flex max-h-[85vh] w-full max-w-sm flex-col bg-dv-panel2 p-5 shadow-pixel">
        <span className="eyebrow">TERMS &amp; PRIVACY · v{TERMS_VERSION}</span>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["terms", "privacy"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={"item-slot py-2 text-[10px] tracking-[0.12em] text-[#fdf3dc] " + (tab === t ? "border-dv-brassLight" : "")}
            >
              {t === "terms" ? "TERMS" : "PRIVACY"}
            </button>
          ))}
        </div>

        <div className="mt-3 flex-1 space-y-4 overflow-y-auto pr-1 text-xs leading-relaxed text-[#fdf3dc]">
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-1 text-[11px] text-dv-brassLight">{s.title}</h3>
              {s.body.map((p, i) => (
                <p key={i} className="mb-1">{p}</p>
              ))}
            </div>
          ))}
        </div>

        {mode === "accept" ? (
          <>
            <label className="mt-4 flex items-start gap-2 text-[11px] text-[#fdf3dc]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              I have read the Terms and the Privacy Policy and agree to them.
            </label>
            {error && <p className="mt-2 text-[10px] text-red-300">{error}</p>}
            <button
              type="button"
              disabled={!agreed || saving}
              onClick={accept}
              className="mt-3 w-full bg-dv-brass py-3 text-[11px] text-dv-bg disabled:opacity-50"
            >
              {saving ? "SAVING..." : "AGREE AND CONTINUE"}
            </button>
          </>
        ) : (
          <button type="button" onClick={onClose} className="mt-4 w-full border border-dv-brassLight/60 py-3 text-[11px] text-dv-brassLight">
            CLOSE
          </button>
        )}
      </div>
    </div>
  );
}
