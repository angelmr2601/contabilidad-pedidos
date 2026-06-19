alter table public.pedidos
  add column if not exists coste_fijo_snapshot numeric;

alter table public.productos
  add column if not exists venta_unidad_snapshot numeric,
  add column if not exists coste_unidad_snapshot numeric;

with precios as (
  select
    coste_fan,
    venta_fan,
    coste_retro_player,
    venta_retro_player,
    coste_personalizacion,
    venta_personalizacion,
    coste_manga_larga,
    venta_manga_larga,
    coste_fijo_pedido
  from public.configuracion_precios
  order by id
  limit 1
)
update public.pedidos
set coste_fijo_snapshot = precios.coste_fijo_pedido
from precios
where coste_fijo_snapshot is null;

with precios as (
  select
    coste_fan,
    venta_fan,
    coste_retro_player,
    venta_retro_player,
    coste_personalizacion,
    venta_personalizacion,
    coste_manga_larga,
    venta_manga_larga
  from public.configuracion_precios
  order by id
  limit 1
)
update public.productos
set
  coste_unidad_snapshot = case
    when productos.tipo = 'Fan' then precios.coste_fan
    when productos.tipo = 'Retro/Player' then precios.coste_retro_player
    else coalesce(productos.coste_manual, 0)
  end
  + case
    when productos.tipo <> 'Otro' and productos.personalizacion then precios.coste_personalizacion
    else 0
  end
  + case
    when productos.tipo <> 'Otro' and productos.manga = 'Larga' then precios.coste_manga_larga
    else 0
  end,
  venta_unidad_snapshot = case
    when productos.tipo = 'Fan' then precios.venta_fan
    when productos.tipo = 'Retro/Player' then precios.venta_retro_player
    else coalesce(productos.precio_venta_manual, 0)
  end
  + case
    when productos.tipo <> 'Otro' and productos.personalizacion then precios.venta_personalizacion
    else 0
  end
  + case
    when productos.tipo <> 'Otro' and productos.manga = 'Larga' then precios.venta_manga_larga
    else 0
  end
from precios
where coste_unidad_snapshot is null
  or venta_unidad_snapshot is null;
