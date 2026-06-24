alter table public.hostinger_mail_message_statuses
  add column if not exists payload_metadata jsonb not null default '{}'::jsonb;
