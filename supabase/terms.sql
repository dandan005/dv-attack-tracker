-- Terms and privacy consent (run once in the Supabase SQL editor).
alter table members add column if not exists terms_version text;
alter table members add column if not exists terms_accepted_at timestamptz;
