alter table public.pedidos
  add column if not exists incluir_gastos_envio boolean not null default false,
  add column if not exists gasto_envio_snapshot numeric;

update public.pedidos
set gasto_envio_snapshot = null
where incluir_gastos_envio = false;
