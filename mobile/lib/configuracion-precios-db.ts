import type { ConfiguracionPrecios } from "@/types";
import { PRECIOS_POR_DEFECTO } from "./precios";
import { supabase } from "./supabase";

type ConfigDB = Record<string, number | null>;

export function preciosDesdeDB(data: ConfigDB): ConfiguracionPrecios {
  return {
    costeFan: Number(data.coste_fan ?? PRECIOS_POR_DEFECTO.costeFan), ventaFan: Number(data.venta_fan ?? PRECIOS_POR_DEFECTO.ventaFan),
    costePlayer: Number(data.coste_player ?? data.coste_retro_player ?? PRECIOS_POR_DEFECTO.costePlayer), ventaPlayer: Number(data.venta_player ?? data.venta_retro_player ?? PRECIOS_POR_DEFECTO.ventaPlayer),
    costeRetro: Number(data.coste_retro ?? data.coste_retro_player ?? PRECIOS_POR_DEFECTO.costeRetro), ventaRetro: Number(data.venta_retro ?? data.venta_retro_player ?? PRECIOS_POR_DEFECTO.ventaRetro),
    costePersonalizada: Number(data.coste_personalizada ?? PRECIOS_POR_DEFECTO.costePersonalizada), ventaPersonalizada: Number(data.venta_personalizada ?? PRECIOS_POR_DEFECTO.ventaPersonalizada),
    costeInfantil: Number(data.coste_infantil ?? data.coste_traje_infantil ?? PRECIOS_POR_DEFECTO.costeInfantil), ventaInfantil: Number(data.venta_infantil ?? data.venta_traje_infantil ?? PRECIOS_POR_DEFECTO.ventaInfantil),
    costePersonalizacion: Number(data.coste_personalizacion ?? PRECIOS_POR_DEFECTO.costePersonalizacion), ventaPersonalizacion: Number(data.venta_personalizacion ?? PRECIOS_POR_DEFECTO.ventaPersonalizacion),
    costeParche: Number(data.coste_parche ?? PRECIOS_POR_DEFECTO.costeParche), ventaParche: Number(data.venta_parche ?? PRECIOS_POR_DEFECTO.ventaParche),
    costeMangaLarga: Number(data.coste_manga_larga ?? PRECIOS_POR_DEFECTO.costeMangaLarga), ventaMangaLarga: Number(data.venta_manga_larga ?? PRECIOS_POR_DEFECTO.ventaMangaLarga),
    costeFijoPedido: Number(data.coste_fijo_pedido ?? PRECIOS_POR_DEFECTO.costeFijoPedido),
  };
}

function preciosParaDB(p: ConfiguracionPrecios) {
  return { coste_fan: p.costeFan, venta_fan: p.ventaFan, coste_retro_player: p.costeRetro, venta_retro_player: p.ventaRetro, coste_player: p.costePlayer, venta_player: p.ventaPlayer, coste_retro: p.costeRetro, venta_retro: p.ventaRetro, coste_personalizada: p.costePersonalizada, venta_personalizada: p.ventaPersonalizada, coste_infantil: p.costeInfantil, venta_infantil: p.ventaInfantil, coste_traje_infantil: p.costeInfantil, venta_traje_infantil: p.ventaInfantil, coste_personalizacion: p.costePersonalizacion, venta_personalizacion: p.ventaPersonalizacion, coste_parche: p.costeParche, venta_parche: p.ventaParche, coste_manga_larga: p.costeMangaLarga, venta_manga_larga: p.ventaMangaLarga, coste_fijo_pedido: p.costeFijoPedido, updated_at: new Date().toISOString() };
}

export async function cargarConfiguracionPrecios(): Promise<ConfiguracionPrecios> {
  const { data, error } = await supabase.from("configuracion_precios").select("*").eq("id", 1).single();
  if (error || !data) return { ...PRECIOS_POR_DEFECTO };
  return preciosDesdeDB(data as ConfigDB);
}
export async function guardarConfiguracionPrecios(precios: ConfiguracionPrecios) {
  const { error } = await supabase.from("configuracion_precios").update(preciosParaDB(precios)).eq("id", 1);
  if (error) throw error;
}
