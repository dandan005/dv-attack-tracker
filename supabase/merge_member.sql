-- Run once in the Supabase SQL editor (after roster_placeholders.sql).
-- Merges a roster-only placeholder into the real signed-in member it belongs to, in one transaction.
-- Attack logs and rune picks move over, blank stats are filled in, and the roster entry is removed.
create or replace function merge_member(p_placeholder uuid, p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ph members%rowtype;
  tg members%rowtype;
begin
  select * into ph from members where id = p_placeholder;
  select * into tg from members where id = p_target;
  if ph.id is null or tg.id is null then raise exception 'Member not found'; end if;
  if ph.discord_id not like 'roster:%' then raise exception 'That player is not a roster-only entry'; end if;
  if tg.auth_user_id is null then raise exception 'Target has not signed in yet'; end if;

  -- Attack logs: drop placeholder logs that clash with the target's, then move the rest.
  delete from attack_logs a using attack_logs b
    where a.member_id = p_placeholder and b.member_id = p_target
      and a.cycle_start = b.cycle_start and a.day_number = b.day_number;
  update attack_logs set member_id = p_target where member_id = p_placeholder;

  -- Rune picks: same idea.
  delete from rune_picks a using rune_picks b
    where a.member_id = p_placeholder and b.member_id = p_target
      and a.cycle_start = b.cycle_start and a.day_number = b.day_number;
  update rune_picks set member_id = p_target where member_id = p_placeholder;

  -- Fill blank stats on the target from the placeholder (the target's own values win).
  update members set
    guild_id = coalesce(tg.guild_id, ph.guild_id),
    promotion_tier = coalesce(tg.promotion_tier, ph.promotion_tier),
    level = coalesce(tg.level, ph.level),
    stage = coalesce(tg.stage, ph.stage),
    dv_map = coalesce(tg.dv_map, ph.dv_map),
    gr_boss = coalesce(tg.gr_boss, ph.gr_boss),
    custom_avatar = coalesce(tg.custom_avatar, ph.custom_avatar)
  where id = p_target;

  -- Remove the roster entry and the placeholder row.
  delete from roster where key = substring(ph.discord_id from 8);
  delete from members where id = p_placeholder;
end;
$$;
