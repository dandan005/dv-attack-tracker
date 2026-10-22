-- Day rune picks for the Ledger (run once in the Supabase SQL editor).
create table if not exists rune_picks (
  id uuid primary key default gen_random_uuid(),
  guild_id int not null,
  member_id uuid not null references members(id) on delete cascade,
  cycle_start date not null,
  day_number int not null check (day_number between 1 and 3),
  rune_name text not null,
  created_at timestamptz default now(),
  unique (member_id, cycle_start, day_number),
  unique (guild_id, cycle_start, day_number, rune_name)
);

alter table rune_picks enable row level security;
