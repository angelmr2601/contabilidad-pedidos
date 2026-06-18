import { supabase } from "./supabase";
import { PRECIOS_POR_DEFECTO } from "./precios";
import type { ConfiguracionPrecios } from "../types";

type ConfiguracionPreciosDB = {
  coste_fan: number;
  venta_fan: number;
  coste_retro_player: number;
  venta_retro_player: number;
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
    costeRetroPlayer: Number(data.coste_retro_player),
    ventaRetroPlayer: Number(data.venta_retro_player),
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
    coste_retro_player: precios.costeRetroPlayer,
    venta_retro_player: precios.ventaRetroPlayer,
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
