create table if not exists public.catalogo_productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.catalogo_variantes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.catalogo_productos(id) on delete cascade,
  edicion text not null default 'LaLiga',
  tipo text not null default 'Fan',
  etiqueta text not null default '',
  precio numeric(10,2),
  imagen_url text,
  created_at timestamptz not null default now()
);
alter table public.catalogo_productos enable row level security;
alter table public.catalogo_variantes enable row level security;
drop policy if exists "catalogo productos autenticados" on public.catalogo_productos;
create policy "catalogo productos autenticados" on public.catalogo_productos for all to authenticated using (true) with check (true);
drop policy if exists "catalogo variantes autenticados" on public.catalogo_variantes;
create policy "catalogo variantes autenticados" on public.catalogo_variantes for all to authenticated using (true) with check (true);
insert into storage.buckets (id, name, public) values ('catalogo-productos', 'catalogo-productos', true) on conflict (id) do update set public = true;
drop policy if exists "catalogo imágenes autenticadas" on storage.objects;
create policy "catalogo imágenes autenticadas" on storage.objects for all to authenticated using (bucket_id = 'catalogo-productos') with check (bucket_id = 'catalogo-productos');