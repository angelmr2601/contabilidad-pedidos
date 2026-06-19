insert into public.configuracion_precios (
  id,
  coste_fan,
  venta_fan,
  coste_retro_player,
  venta_retro_player,
  coste_personalizacion,
  venta_personalizacion,
  coste_manga_larga,
  venta_manga_larga,
  coste_fijo_pedido,
  updated_at
)
values (
  1,
  6.5,
  15,
  9.4,
  18,
  2,
  2,
  2,
  2,
  4,
  now()
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'configuracion_precios'
      and policyname = 'Permitir lectura publica de configuracion_precios'
  ) then
    create policy "Permitir lectura publica de configuracion_precios"
      on public.configuracion_precios
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'configuracion_precios'
      and policyname = 'Permitir guardar configuracion_precios'
  ) then
    create policy "Permitir guardar configuracion_precios"
      on public.configuracion_precios
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
