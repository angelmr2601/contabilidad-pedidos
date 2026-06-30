-- Permite registrar qué parche se seleccionó cuando un producto lleva parche.

alter table if exists public.productos
  add column if not exists nombre_parche text not null default '';
