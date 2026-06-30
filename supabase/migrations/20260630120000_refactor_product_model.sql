-- Refactor no destructivo del modelo de productos.
-- Decisión: los registros antiguos tipo 'Retro/Player' se convierten a 'Retro'.
-- Los registros tipo 'Otro' se mantienen para revisión manual; la app los lee temporalmente como 'Personalizada'.

alter table if exists productos
  add column if not exists parche boolean not null default false,
  add column if not exists manga_larga boolean not null default false;

update productos
set manga_larga = true
where manga = 'Larga' and manga_larga = false;

update productos
set tipo = 'Retro'
where tipo = 'Retro/Player';

alter table if exists configuracion_precios
  add column if not exists coste_personalizada numeric(10, 2),
  add column if not exists venta_personalizada numeric(10, 2),
  add column if not exists coste_infantil numeric(10, 2),
  add column if not exists venta_infantil numeric(10, 2),
  add column if not exists coste_parche numeric(10, 2),
  add column if not exists venta_parche numeric(10, 2),
  add column if not exists coste_manga_larga numeric(10, 2),
  add column if not exists venta_manga_larga numeric(10, 2),
  add column if not exists coste_fijo_pedido numeric(10, 2);

insert into configuracion_precios (
  id,
  coste_fan,
  venta_fan,
  coste_player,
  venta_player,
  coste_retro,
  venta_retro,
  coste_personalizada,
  venta_personalizada,
  coste_infantil,
  venta_infantil,
  coste_personalizacion,
  venta_personalizacion,
  coste_parche,
  venta_parche,
  coste_manga_larga,
  venta_manga_larga,
  coste_fijo_pedido
)
values (1, 6.50, 15.00, 9.40, 18.00, 9.40, 18.00, 8.50, 17.00, 6.50, 15.00, 2.00, 2.00, 0.50, 2.00, 2.00, 2.00, 4.00)
on conflict (id) do update set
  coste_player = coalesce(configuracion_precios.coste_player, excluded.coste_player),
  venta_player = coalesce(configuracion_precios.venta_player, excluded.venta_player),
  coste_retro = coalesce(configuracion_precios.coste_retro, excluded.coste_retro),
  venta_retro = coalesce(configuracion_precios.venta_retro, excluded.venta_retro),
  coste_personalizada = coalesce(configuracion_precios.coste_personalizada, excluded.coste_personalizada),
  venta_personalizada = coalesce(configuracion_precios.venta_personalizada, excluded.venta_personalizada),
  coste_infantil = coalesce(configuracion_precios.coste_infantil, excluded.coste_infantil),
  venta_infantil = coalesce(configuracion_precios.venta_infantil, excluded.venta_infantil),
  coste_personalizacion = coalesce(configuracion_precios.coste_personalizacion, excluded.coste_personalizacion),
  venta_personalizacion = coalesce(configuracion_precios.venta_personalizacion, excluded.venta_personalizacion),
  coste_parche = coalesce(configuracion_precios.coste_parche, excluded.coste_parche),
  venta_parche = coalesce(configuracion_precios.venta_parche, excluded.venta_parche),
  coste_manga_larga = coalesce(configuracion_precios.coste_manga_larga, excluded.coste_manga_larga),
  venta_manga_larga = coalesce(configuracion_precios.venta_manga_larga, excluded.venta_manga_larga),
  coste_fijo_pedido = coalesce(configuracion_precios.coste_fijo_pedido, excluded.coste_fijo_pedido);
