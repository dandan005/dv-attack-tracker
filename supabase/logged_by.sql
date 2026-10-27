alter table attack_logs
  add column if not exists logged_by uuid references members(id) on delete set null;
