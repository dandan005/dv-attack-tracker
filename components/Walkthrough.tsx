"use client";

import { useState } from "react";

type Step = { title: string; body: string; emoji: string };

const STEPS: Step[] = [
  {
    emoji: "ᚦ",
    title: "Welcome to Dragon Valley",
    body: "This hub tracks your guild's raid cycle — 6 attack days followed by a standby day, all in sync with the game's global reset.",
  },
  {
    emoji: "ᛏ",
    title: "Log your attacks",
    body: "On the Ledger tab, tap the attack button each day you raid. Your logged days light up so the guild can see everyone's progress.",
  },
  {
    emoji: "ᛖ",
    title: "Guild Progress",
    body: "Below the log button, see every member's attack history for the current cycle. Admins can ping anyone who's falling behind.",
  },
  {
    emoji: "ᚺ",
    title: "Wyvern Tracker",
    body: "From Day 3 onward, mark the wyvern's elemental trace so the whole guild knows what to target.",
  },
  {
    emoji: "ᚨ",
    title: "Guide, Meals & Runes",
    body: "Check the other tabs anytime for field guides, skill builds, spirit info, cooking recipes, and rune setups.",
  },
  {
    emoji: "ᛞ",
    title: "Need this again?",
    body: "Tap the ? icon in the header anytime to replay this walkthrough.",
  },
];

export function Walkthrough({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function next() {
    if (isLast) {
      onClose();
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    onClose();
    setStep(0);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-4 pb-20">
      <div className="pixel-border w-full max-w-sm bg-dv-panel/95 p-5 shadow-pixel">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-dv-emerald">
            TUTORIAL {step + 1}/{STEPS.length}
          </span>
          <button
            type="button"
            onClick={skip}
            className="text-[10px] uppercase tracking-[.08em] text-slate-300/50 hover:text-dv-brassLight"
          >
            Skip
          </button>
        </div>

        <div className="mt-4 text-center">
          <div className="text-3xl">{current.emoji}</div>
          <h2 className="mt-3 text-lg text-dv-brassLight">{current.title}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-200/70">
            {current.body}
          </p>
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 w-1.5 rounded-full " +
                (i === step ? "bg-dv-brass" : "bg-dv-line")
              }
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="pixel-frame flex-1 border border-dv-line px-4 py-3 text-[11px] text-dv-brassLight"
            >
              BACK
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="pixel-frame flex-1 bg-dv-brass px-4 py-3 text-[11px] text-dv-bg shadow-pixel-sm hover:bg-dv-brassLight active:translate-y-[2px]"
          >
            {isLast ? "GOT IT" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}
