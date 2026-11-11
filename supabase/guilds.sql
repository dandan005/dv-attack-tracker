-- ------------------------------------------------------------
-- guilds
-- ------------------------------------------------------------
create table if not exists guilds (
  id                  int4 primary key,
  code                text not null unique,
  name                text not null,
  discord_webhook_url text
);

-- Add discord_channel_id column to the guilds table
ALTER TABLE guilds 
ADD COLUMN IF NOT EXISTS discord_channel_id TEXT;