-- Dragon Valley Attack Tracker — Supabase schema
-- Run this in the Supabase SQL editor after creating your project.

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  discord_id text not null,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists attack_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  day_number int not null check (day_number between 1 and 6),
  cycle_start date not null,
  promotion_tier int check (promotion_tier >= 0),
  damage_score bigint check (damage_score >= 0),
  logged_at timestamptz default now(),
  unique (member_id, day_number, cycle_start)
);

-- Safe migration for an existing installation.
alter table attack_logs add column if not exists promotion_tier int check (promotion_tier >= 0);
alter table attack_logs add column if not exists damage_score bigint check (damage_score >= 0);

create table if not exists app_settings (
  id int primary key default 1,
  discord_webhook_url text,
  anchor_date date default '2026-01-05',
  reset_hour_utc int default 0,
  constraint single_row check (id = 1)
);

insert into app_settings (id) values (1) on conflict (id) do nothing;

alter table members enable row level security;
alter table attack_logs enable row level security;
alter table app_settings enable row level security;

-- Any signed-in guild member can see the whole roster and every attack log —
-- that's the point of a shared tracker. Only service-role (server) writes to
-- members; a member can only insert/update their own attack log.

create policy "members are viewable by authenticated users"
  on members for select
  to authenticated
  using (true);

create policy "attack logs are viewable by authenticated users"
  on attack_logs for select
  to authenticated
  using (true);

create policy "members can log their own attacks"
  on attack_logs for insert
  to authenticated
  with check (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy "members can update their own attacks"
  on attack_logs for update
  to authenticated
  using (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy "settings are viewable by authenticated users"
  on app_settings for select
  to authenticated
  using (true);

create policy "authenticated users can update settings"
  on app_settings for all
  to authenticated
  using (true)
  with check (true);
