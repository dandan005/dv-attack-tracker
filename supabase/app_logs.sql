-- Error log for the whole guild (run once in the Supabase SQL editor).
-- Written by the server with the admin key; the creator reads it through /api/app-logs.
create table if not exists app_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  level text not null default 'error' check (level in ('error', 'warn', 'info')),
  source text not null default '',
  message text not null default '',
  details text,
  member_id uuid references members(id) on delete set null
);

create index if not exists app_logs_created_at_idx on app_logs (created_at desc);

alter table app_logs enable row level security;
