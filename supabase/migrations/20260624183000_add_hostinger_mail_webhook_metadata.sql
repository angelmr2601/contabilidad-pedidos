alter table public.hostinger_mail_message_statuses
  add column if not exists sender_email text,
  add column if not exists sender_name text,
  add column if not exists subject text not null default '',
  add column if not exists excerpt text not null default '',
  add column if not exists received_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'hostinger_mail_message_statuses'
      and policyname = 'Permitir lectura anonima de estados de correo'
  ) then
    create policy "Permitir lectura anonima de estados de correo"
      on public.hostinger_mail_message_statuses
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'hostinger_mail_message_statuses'
      and policyname = 'Permitir escritura anonima de estados de correo'
  ) then
    create policy "Permitir escritura anonima de estados de correo"
      on public.hostinger_mail_message_statuses
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
