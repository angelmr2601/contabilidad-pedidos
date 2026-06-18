create table if not exists public.opciones_producto (
  id text primary key,
  nombre text not null,
  precio numeric not null,
  sizes text[] not null default '{}',
  orden integer not null,
  updated_at timestamptz not null default now()
);

alter table public.opciones_producto enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'opciones_producto'
      and policyname = 'Permitir lectura publica de opciones_producto'
  ) then
    create policy "Permitir lectura publica de opciones_producto"
      on public.opciones_producto
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

insert into public.opciones_producto (id, nombre, precio, sizes, orden, updated_at)
values
  ('camiseta_hincha', 'Camiseta de hincha', 7.5, '{}', 1, now()),
  ('camiseta_jugador', 'Camiseta de jugador', 11, '{}', 2, now()),
  ('camiseta_vintage', 'Camiseta vintage', 12, '{}', 3, now()),
  ('camiseta_mangas_largas', 'Camiseta de mangas largas', 12.7, '{}', 4, now()),
  (
    'traje_infantil',
    'Traje infantil',
    9.3,
    array['16', '18', '20', '22', '24', '26', '28'],
    5,
    now()
  ),
  ('parche', 'Parche', 0.9, '{}', 6, now()),
  ('talla_3xl', '3XL', 0.9, array['3XL'], 7, now()),
  ('talla_4xl', '4XL', 1.7, array['4XL'], 8, now())
on conflict (id) do update set
  nombre = excluded.nombre,
  precio = excluded.precio,
  sizes = excluded.sizes,
  orden = excluded.orden,
  updated_at = excluded.updated_at;
