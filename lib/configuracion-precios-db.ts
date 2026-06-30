import { supabase } from "./supabase";
import { PRECIOS_POR_DEFECTO } from "./precios";
import type { ConfiguracionPrecios } from "../types";

type ConfiguracionPreciosDB = {
  coste_fan: number;
  venta_fan: number;
  coste_retro_player: number;
  venta_retro_player: number;
  coste_player: number | null;
  venta_player: number | null;
  coste_retro: number | null;
  venta_retro: number | null;
  coste_personalizada: number | null;
  venta_personalizada: number | null;
  coste_infantil: number | null;
  venta_infantil: number | null;
  coste_traje_infantil: number | null;
  venta_traje_infantil: number | null;
  coste_parche: number | null;
  venta_parche: number | null;
  coste_talla_3xl: number | null;
  venta_talla_3xl: number | null;
  coste_talla_4xl: number | null;
  venta_talla_4xl: number | null;
  coste_personalizacion: number;
  venta_personalizacion: number;
  coste_manga_larga: number;
  venta_manga_larga: number;
  coste_fijo_pedido: number;
};

function preciosDesdeDB(data: ConfiguracionPreciosDB): ConfiguracionPrecios {
  return {
    costeFan: Number(data.coste_fan),
    ventaFan: Number(data.venta_fan),
    costePlayer: Number(data.coste_player ?? data.coste_retro_player),
    ventaPlayer: Number(data.venta_player ?? data.venta_retro_player),
    costeRetro: Number(data.coste_retro ?? data.coste_retro_player),
    ventaRetro: Number(data.venta_retro ?? data.venta_retro_player),
    costePersonalizada: Number(
      data.coste_personalizada ?? PRECIOS_POR_DEFECTO.costePersonalizada,
    ),
    ventaPersonalizada: Number(
      data.venta_personalizada ?? PRECIOS_POR_DEFECTO.ventaPersonalizada,
    ),
    costeInfantil: Number(
      data.coste_infantil ??
        data.coste_traje_infantil ??
        PRECIOS_POR_DEFECTO.costeInfantil,
    ),
    ventaInfantil: Number(
      data.venta_infantil ??
        data.venta_traje_infantil ??
        PRECIOS_POR_DEFECTO.ventaInfantil,
    ),
    costeParche: Number(data.coste_parche ?? PRECIOS_POR_DEFECTO.costeParche),
    ventaParche: Number(data.venta_parche ?? PRECIOS_POR_DEFECTO.ventaParche),
    costeTalla3XL: Number(
      data.coste_talla_3xl ?? PRECIOS_POR_DEFECTO.costeTalla3XL,
    ),
    ventaTalla3XL: Number(
      data.venta_talla_3xl ?? PRECIOS_POR_DEFECTO.ventaTalla3XL,
    ),
    costeTalla4XL: Number(
      data.coste_talla_4xl ?? PRECIOS_POR_DEFECTO.costeTalla4XL,
    ),
    ventaTalla4XL: Number(
      data.venta_talla_4xl ?? PRECIOS_POR_DEFECTO.ventaTalla4XL,
    ),
    costePersonalizacion: Number(data.coste_personalizacion),
    ventaPersonalizacion: Number(data.venta_personalizacion),
    costeMangaLarga: Number(data.coste_manga_larga),
    ventaMangaLarga: Number(data.venta_manga_larga),
    costeFijoPedido: Number(data.coste_fijo_pedido),
  };
}

function preciosParaDB(precios: ConfiguracionPrecios) {
  return {
    coste_fan: precios.costeFan,
    venta_fan: precios.ventaFan,
    coste_retro_player: precios.costeRetro,
    venta_retro_player: precios.ventaRetro,
    coste_player: precios.costePlayer,
    venta_player: precios.ventaPlayer,
    coste_retro: precios.costeRetro,
    venta_retro: precios.ventaRetro,
    coste_personalizada: precios.costePersonalizada,
    venta_personalizada: precios.ventaPersonalizada,
    coste_infantil: precios.costeInfantil,
    venta_infantil: precios.ventaInfantil,
    coste_traje_infantil: precios.costeInfantil,
    venta_traje_infantil: precios.ventaInfantil,
    coste_parche: precios.costeParche,
    venta_parche: precios.ventaParche,
    coste_talla_3xl: precios.costeTalla3XL,
    venta_talla_3xl: precios.ventaTalla3XL,
    coste_talla_4xl: precios.costeTalla4XL,
    venta_talla_4xl: precios.ventaTalla4XL,
    coste_personalizacion: precios.costePersonalizacion,
    venta_personalizacion: precios.ventaPersonalizacion,
    coste_manga_larga: precios.costeMangaLarga,
    venta_manga_larga: precios.ventaMangaLarga,
    coste_fijo_pedido: precios.costeFijoPedido,
    updated_at: new Date().toISOString(),
  };
}

export async function cargarConfiguracionPrecios(): Promise<ConfiguracionPrecios> {
  const { data, error } = await supabase
    .from("configuracion_precios")
    .select(
      `
      coste_fan,
      venta_fan,
      coste_retro_player,
      venta_retro_player,
      coste_player,
      venta_player,
      coste_retro,
      venta_retro,
      coste_personalizada,
      venta_personalizada,
      coste_infantil,
      venta_infantil,
      coste_traje_infantil,
      venta_traje_infantil,
      coste_parche,
      venta_parche,
      coste_talla_3xl,
      venta_talla_3xl,
      coste_talla_4xl,
      venta_talla_4xl,
      coste_personalizacion,
      venta_personalizacion,
      coste_manga_larga,
      venta_manga_larga,
      coste_fijo_pedido
    `,
    )
    .eq("id", 1)
    .single();

  if (error || !data) {
    if (error) {
      console.error(error);
    }
    return { ...PRECIOS_POR_DEFECTO };
  }

  return preciosDesdeDB(data as ConfiguracionPreciosDB);
}

export async function guardarConfiguracionPrecios(
  precios: ConfiguracionPrecios,
) {
  const { error } = await supabase
    .from("configuracion_precios")
    .update(preciosParaDB(precios))
    .eq("id", 1);

  if (error) {
    throw error;
  }
}
