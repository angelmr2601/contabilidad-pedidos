alter table public.pedidos
  add column if not exists numero_pedido text,
  add column if not exists numero_seguimiento text;
