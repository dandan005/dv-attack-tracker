-- Run once in the Supabase SQL editor.
-- Uploaded in-game avatars: a URL column on members and roster, plus a public storage bucket.
alter table members add column if not exists custom_avatar_url text;
alter table roster add column if not exists custom_avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
