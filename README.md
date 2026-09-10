# Dragon Valley Attack Tracker

A pixel-themed PWA for your Slayer Legend guild to coordinate Dragon Valley's six-day raid cycle, record attacks, and keep promotion-aware damage context in one place.

## Mechanics-aware iteration

Public community references describe Dragon Valley as a promotion-based guild raid: damage dealt at a higher promotion contributes more points. The tracker now records those two useful inputs alongside each D1–D6 attack:

- **Promotion tier** — the promotion level used for the run.
- **Damage / raid points** — the result worth comparing across the guild.
- **Guild readout** — total recorded raid points, top damage, best check-in rate, and pending members for the current day.

The promotion and damage fields are optional, so the tracker still works as a simple attack checklist when a member only wants to mark participation. The API also falls back to the original attack-log shape until the Supabase migration has been run.

## What's included

- **Splash** — Discord login
- **Main dashboard** — live D1–D6 cycle, countdown, wyvern trace, promotion-aware attack logging, and guild progress grid
- **Raid score context** — total recorded points, top damage member, per-member point totals, and best promotion tier
- **Settings** — configure the Discord webhook and cycle anchor
- **Auto-reminders** — a Vercel Cron job pings members missing the current day's attack
- **PWA** — installable on phone home screens, works offline for the shell

## Supabase migration

For a new database, run supabase/schema.sql as normal. For an existing database, run the same file or apply these two statements in the Supabase SQL editor:

    alter table attack_logs add column if not exists promotion_tier int check (promotion_tier >= 0);
    alter table attack_logs add column if not exists damage_score bigint check (damage_score >= 0);

Until those columns exist, attack logging continues to work without saving the optional score fields.

## Setup

1. Create a Discord OAuth app in the Discord Developer Portal and add your Supabase auth callback URL.
2. Create a Supabase project, enable Discord authentication, and run supabase/schema.sql.
3. Add the values from .env.example to your local environment and Vercel deployment.
4. Create a Discord webhook and save it from the app's Settings page.
5. Set the D1 anchor date and UTC reset hour so every member shares the same clock.

Local development:

    npm install
    cp .env.example .env.local
    npm run dev

The Vercel cron in vercel.json runs daily at 20:00 UTC. Change that schedule if your guild's reset window is different.

## Notes

- The countdown assumes a six-day cycle that repeats indefinitely from the anchor date.
- The app intentionally does not hardcode undocumented boss formulas or copy Slayer Legend assets. Score values are entered from the in-game result so the tracker stays useful across balance changes.
- app_settings is a single shared row, representing one guild per deployment.
