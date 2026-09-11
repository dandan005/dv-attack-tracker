# Dragon Valley Attack Tracker

I made this for my Slayer Legend guild because we kept losing track of who actually hit Dragon Valley each cycle and what promotion/damage they ran. Google Sheets got messy fast, so I built a little pixel-themed PWA instead. It handles the six-day raid cycle, logs attacks, and keeps score context in one place so I'm not chasing people on Discord every reset.

## Why the promotion/damage stuff

From what people say in the community, DV is a promotion-based raid — hitting at a higher promotion is worth more points. So on top of just "did you attack today," I added two optional fields to each D1–D6 log:

- **Promotion tier** — what promotion the run was at
- **Damage / raid points** — whatever number the game spit out for that attack

Then there's a readout on the dashboard: total points for the cycle, who's doing the most damage, who's got the best check-in streak, and who still hasn't logged today.

Both fields are optional on purpose — if someone just wants to tap "attacked" without typing in numbers, that still works. The API also still accepts the old bare attack-log shape, so I didn't break anything for people who haven't run the DB migration yet.

## What's actually in here

- Discord login splash screen
- Main dashboard — D1–D6 cycle tracker, countdown, wyvern trace (so we're not all hunting different elements), attack logging with the score fields, and a progress grid for the whole guild
- Raid score readout — totals, top damage, per-member points, best promotion used
- Settings tab for the Discord webhook + cycle anchor date
- A Vercel cron job that pings whoever hasn't logged an attack yet
- Installable as a PWA (works offline for the shell, at least)

## If you're updating an existing DB

New install → just run `supabase/schema.sql`, done.

Already have data in there? Run these two in the Supabase SQL editor instead of nuking anything:

```sql
alter table attack_logs add column if not exists promotion_tier int check (promotion_tier >= 0);
alter table attack_logs add column if not exists damage_score bigint check (damage_score >= 0);
```

Until you run that, attack logging still works fine — it just won't save the promotion/damage numbers.

## Setup

1. Make a Discord OAuth app in the dev portal, point the redirect at your Supabase auth callback.
2. Spin up a Supabase project, turn on Discord auth, run `supabase/schema.sql`.
3. Copy `.env.example` → `.env.local` (and set the same vars on Vercel).
4. Make a Discord webhook, paste it into the app's Settings tab.
5. Set your D1 anchor date + reset hour (UTC) so everyone's on the same clock.

Then just:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The cron in `vercel.json` fires at 20:00 UTC by default — change it if your guild resets at a different time.

## Random notes to self

- Cycle math assumes a six-day loop that just keeps repeating from the anchor date forever.
- I'm not hardcoding any of Slayer Legend's actual boss formulas or ripping their assets — damage numbers are typed in from what the game shows, so this doesn't break every time they rebalance something.
- `app_settings` is one shared row per deployment — this is built for a single guild, not multi-tenant.
