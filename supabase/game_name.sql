-- Run once in the Supabase SQL editor.
-- In-game name for each member. Login keeps overwriting username with the Discord name,
-- so the in-game name lives in its own column and is shown in the Ledger, Ranking and Players list.
alter table members add column if not exists game_name text;
