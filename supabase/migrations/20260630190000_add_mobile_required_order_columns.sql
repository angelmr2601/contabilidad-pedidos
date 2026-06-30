-- Columnas no destructivas requeridas por la app móvil para seguimiento y archivado automático.

alter table if exists pedidos
  add column if not exists archivado boolean not null default false,
  add column if not exists numero_seguimiento text default null;

