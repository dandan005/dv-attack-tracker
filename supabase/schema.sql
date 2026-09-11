-- Dragon Valley Attack Tracker — Supabase schema
-- Run this in the Supabase SQL editor after creating the project.

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

-- This function is the database-side membership gate. It is SECURITY DEFINER
-- so RLS can use it without recursively querying the members policy.
create or replace function public.is_guild_member()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.members where auth_user_id = auth.uid());
$$;

revoke all on function public.is_guild_member() from public;
grant execute on function public.is_guild_member() to authenticated;

drop policy if exists "members are viewable by authenticated users" on members;
drop policy if exists "attack logs are viewable by authenticated users" on attack_logs;
drop policy if exists "members can log their own attacks" on attack_logs;
drop policy if exists "members can update their own attacks" on attack_logs;
drop policy if exists "settings are viewable by authenticated users" on app_settings;
drop policy if exists "authenticated users can update settings" on app_settings;

create policy "verified guild members can view members"
  on members for select
  to authenticated
  using (public.is_guild_member());

create policy "verified guild members can view attack logs"
  on attack_logs for select
  to authenticated
  using (public.is_guild_member());

create policy "members can log their own attacks"
  on attack_logs for insert
  to authenticated
  with check (
    public.is_guild_member()
    and member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy "members can update their own attacks"
  on attack_logs for update
  to authenticated
  using (
    public.is_guild_member()
    and member_id in (select id from members where auth_user_id = auth.uid())
  )
  with check (
    public.is_guild_member()
    and member_id in (select id from members where auth_user_id = auth.uid())
  );

-- app_settings has intentionally no authenticated-user policies. Its webhook
-- URL stays server-only; /api/settings exposes only safe fields after the
-- server verifies current Discord guild membership.
