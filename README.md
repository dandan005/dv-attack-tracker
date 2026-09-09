# Dragon Valley Attack Tracker

A pixel-themed PWA for your Slayer Legend guild to log Dragon Valley attacks
(D1–D6) and get pinged on Discord if they miss one. Built with Next.js 14,
Supabase (auth + database), and deployed on Vercel.

## What's included

- **Splash** — Discord login
- **Main dashboard** — live countdown to the next reset, your D1–D6 attack
  log, and a guild-wide progress grid with a "ping missing members" button
- **Settings** — configure your Discord webhook and the cycle's anchor date
- **Auto-reminders** — a Vercel Cron job pings missing members automatically
  once a day, on top of the manual button (this is the piece I added beyond
  your reference screenshot — a guild always forgets to check the app
  right before reset, so the tracker nags for you)
- **PWA** — installable on phone home screens, works offline for the shell

## 1. Create a Discord OAuth app

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → New Application.
2. OAuth2 → add a redirect: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client Secret**.

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Authentication → Providers → enable **Discord**, paste the Client ID/Secret from step 1.
3. SQL Editor → paste and run `supabase/schema.sql` from this repo.
4. Project Settings → API → copy the URL, anon key, and service role key into your `.env`.

## 3. Create a Discord webhook (for pings)

Server Settings → Integrations → Webhooks → New Webhook → copy the URL.
You'll paste this into the app's **Settings** page after your first login
(it's stored in Supabase, not hardcoded).

> Note: Discord webhooks can only `@mention` a user if that user has posted
> in the channel before, or you enable `allowed_mentions: {parse: ["users"]}`
> (already handled in the code) — the mention still requires the member's
> **Discord user ID** to be correct, which is captured automatically from
> their Discord login.

## 4. Set your cycle anchor

In Settings, set "D1 anchor date" to any date you know was a D1 for your
guild, and the reset hour (UTC) Dragon Valley resets at. Everyone's D-day
number is calculated from that — no manual daily updates needed.

## 5. Local development

```bash
npm install
cp .env.example .env.local   # fill in your real values
npm run dev
```

## 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then in the Vercel project dashboard → Settings → Environment Variables, add
the four variables from `.env.example` (including `CRON_SECRET` — Vercel
automatically sends it as a Bearer token to your cron route, no extra config
needed). Redeploy. The cron in `vercel.json` runs daily at 20:00 UTC —
change the schedule to whenever makes sense before your guild's reset.

## Notes / things you may want to tweak

- The countdown assumes a 6-day cycle that repeats indefinitely from the
  anchor date — adjust `lib/cycle.ts` if Dragon Valley's actual cadence
  differs (e.g. weekly with a rest day).
- Icons in `public/icons/` are placeholder pixel-sword art — swap in your
  guild's own logo if you want.
- `app_settings` is a single shared row (one guild per deployment). If you
  ever want multiple guilds in one app, that table needs a `guild_id`.
