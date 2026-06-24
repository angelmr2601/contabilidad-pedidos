alter table public.hostinger_mail_message_statuses
  add column if not exists recipients text[] not null default '{}',
  add column if not exists plain_body text not null default '',
  add column if not exists plain_html text not null default '',
  add column if not exists body_url text,
  add column if not exists attachments jsonb not null default '[]'::jsonb;
