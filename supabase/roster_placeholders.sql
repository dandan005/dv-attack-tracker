-- Run once in the Supabase SQL editor.
-- Gives every roster-only player (no Discord login yet) a members row, so admins can log attacks for them.
-- The placeholder discord_id is 'roster:' || key. Players who already match a member by name are skipped.
insert into members (discord_id, username, guild_id, promotion_tier, level, stage, dv_map, gr_boss, custom_avatar)
select 'roster:' || r.key, r.name, r.guild_id, r.promotion_tier, r.level, r.stage, r.dv_map, r.gr_boss, r.custom_avatar
from roster r
where not exists (
  select 1 from members m
  where lower(m.username) = lower(r.key) or m.discord_id = 'roster:' || r.key
);
