"use client";

import { useState } from "react";

type Step = { title: string; body: string; emoji: string };

const STEPS: Step[] = [
  {
    emoji: "ᚦ",
    title: "Welcome to Dragon Valley",
    body: "The ledger tracks your guild's raid cycle: 6 attack days, then a standby day. Each cycle resets at 10 PM Manila time on Monday.",
  },
  {
    emoji: "ᛏ",
    title: "Log your attack",
    body: "On the Ledger tab, tap LOG TODAY'S ATTACK once you've raided. You can add a damage score too. Once it's logged, the day is sealed.",
  },
  {
    emoji: "ᛖ",
    title: "Guild progress",
    body: "Under your log, see every member's D1 to D6 checkmarks for this cycle. Admins can ping members who haven't checked in yet, and see the guild readout.",
  },
  {
    emoji: "ᚺ",
    title: "Exploration and wyvern",
    body: "Days 1 to 3 are exploration. Days 4 to 6 are the wyvern phase. Set the wyvern's element once it's known so the guild knows what to cook for.",
  },
  {
    emoji: "ᚱ",
    title: "Ranking",
    body: "Tap the trophy in the header to see the leaderboard. Switch between ALL, G1 and G2. Players are sorted by rank tier, then stage, then level.",
  },
  {
    emoji: "ᛃ",
    title: "Assign",
    body: "Staff plan the Dragon Valley seats and Guild Request slots here. Auto-assign fills them by rank once a day. Days 4 to 6 are locked, and day 7 is closed.",
  },
  {
    emoji: "ᚨ",
    title: "Guide, Cooking, Special & Runes",
    body: "Guide has skill builds by stage, spirits and operations. Cooking lists the campfire queue in order. Special has the full meal list with search. Runes covers rune tiers and what each is worth.",
  },
  {
    emoji: "ᛞ",
    title: "Need this again?",
    body: "Open Settings and tap Replay walkthrough to see this tour again.",
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
