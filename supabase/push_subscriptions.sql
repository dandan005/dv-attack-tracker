-- Web push subscriptions for day reminders (run once in the Supabase SQL editor).
create table if not exists push_subscriptions (
  endpoint text primary key,
  member_id uuid not null references members(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
