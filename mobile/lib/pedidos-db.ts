import type { ConfiguracionPrecios, Pedido, Producto, TipoProducto, TallaProducto } from "@/types";
import { aplicarPrecioProductoActual } from "./calculos";
import { supabase } from "./supabase";

type ProductoDB = {
  id: number; pedido_id: number; cliente: string; nombre: string; talla: string; tipo: string; manga: string | null;
  personalizacion: boolean; parche: boolean | null; manga_larga: boolean | null; nombre_personalizacion: string | null;
  numero_personalizacion: string | null; venta_unidad_snapshot: number | null; coste_unidad_snapshot: number | null;
  pagado: boolean; entregado: boolean;
};
type PedidoDB = { id: number; nombre: string; fecha_pedido: string; numero_seguimiento: string | null; archivado: boolean; coste_fijo_snapshot: number | null; productos: ProductoDB[] };

const PRODUCTOS_SELECT = "id,pedido_id,cliente,nombre,talla,tipo,manga,personalizacion,parche,manga_larga,nombre_personalizacion,numero_personalizacion,venta_unidad_snapshot,coste_unidad_snapshot,pagado,entregado";
const PEDIDOS_SELECT = `id,nombre,fecha_pedido,numero_seguimiento,archivado,coste_fijo_snapshot,productos(${PRODUCTOS_SELECT})`;

function normalizarTipo(tipo: string): TipoProducto {
  if (["Fan", "Player", "Retro", "Personalizada", "Infantil"].includes(tipo)) return tipo as TipoProducto;
  if (tipo === "Retro/Player") return "Retro";
  if (tipo === "Traje infantil") return "Infantil";
  return "Personalizada";
}
function productoDesdeDB(p: ProductoDB): Producto {
  return { id: p.id, cliente: p.cliente, nombre: p.nombre, talla: p.talla as TallaProducto, tipo: normalizarTipo(p.tipo), personalizacion: Boolean(p.personalizacion), parche: Boolean(p.parche), mangaLarga: Boolean(p.manga_larga ?? p.manga === "Larga"), nombrePersonalizacion: p.nombre_personalizacion ?? "", numeroPersonalizacion: p.numero_personalizacion ?? "", ventaUnidadSnapshot: p.venta_unidad_snapshot === null ? null : Number(p.venta_unidad_snapshot), costeUnidadSnapshot: p.coste_unidad_snapshot === null ? null : Number(p.coste_unidad_snapshot), pagado: p.pagado, entregado: p.entregado };
}
function productoCamposDB(producto: Producto) {
  return { cliente: producto.cliente, nombre: producto.nombre, talla: producto.talla, tipo: producto.tipo, manga: producto.mangaLarga ? "Larga" : "Corta", personalizacion: producto.personalizacion, parche: producto.parche, manga_larga: producto.mangaLarga, nombre_personalizacion: producto.nombrePersonalizacion, numero_personalizacion: producto.numeroPersonalizacion, venta_unidad_snapshot: producto.ventaUnidadSnapshot, coste_unidad_snapshot: producto.costeUnidadSnapshot, pagado: producto.pagado, entregado: producto.entregado };
}
function productoParaDB(producto: Producto, pedidoId: number) {
  return { pedido_id: pedidoId, ...productoCamposDB(producto) };
}
export const calcularArchivadoPedido = (productos: Producto[]) => productos.length > 0 && productos.every((p) => p.pagado && p.entregado);

function normalizarNumeroSeguimiento(numeroSeguimiento: string | null) {
  const limpio = numeroSeguimiento?.trim() ?? "";
  return limpio.length > 0 ? limpio : null;
}

function pedidoDesdeDB(p: PedidoDB): Pedido {
  return { id: p.id, nombre: p.nombre, fechaPedido: p.fecha_pedido, numeroSeguimiento: normalizarNumeroSeguimiento(p.numero_seguimiento), archivado: p.archivado, costeFijoSnapshot: p.coste_fijo_snapshot === null ? null : Number(p.coste_fijo_snapshot), productos: (p.productos ?? []).map(productoDesdeDB) };
}

export async function cargarPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase.from("pedidos").select(PEDIDOS_SELECT).order("fecha_pedido", { ascending: false }).order("id", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as PedidoDB[]).map(pedidoDesdeDB);
}
export async function crearPedido(nombre: string, fechaPedido: string, precios: ConfiguracionPrecios): Promise<number> {
  const { data, error } = await supabase.from("pedidos").insert({ nombre, fecha_pedido: fechaPedido, archivado: false, coste_fijo_snapshot: precios.costeFijoPedido }).select("id").single();
  if (error) throw error;
  return data.id as number;
}
export async function actualizarPedido(pedidoId: number, nombre: string, fechaPedido: string) {
  const { error } = await supabase.from("pedidos").update({ nombre, fecha_pedido: fechaPedido }).eq("id", pedidoId);
  if (error) throw error;
}
export async function actualizarNumeroSeguimientoPedido(pedidoId: number, numeroSeguimiento: string | null) {
  const { data, error } = await supabase.from("pedidos").update({ numero_seguimiento: normalizarNumeroSeguimiento(numeroSeguimiento) }).eq("id", pedidoId).select(PEDIDOS_SELECT).single();
  if (error) throw error;
  return pedidoDesdeDB(data as PedidoDB);
}
export async function eliminarPedido(pedidoId: number) {
  const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);
  if (error) throw error;
}
export async function guardarArchivadoPedido(pedidoId: number, productos: Producto[]) {
  const { error } = await supabase.from("pedidos").update({ archivado: calcularArchivadoPedido(productos) }).eq("id", pedidoId);
  if (error) throw error;
}
export async function crearProducto(pedidoId: number, producto: Producto, precios: ConfiguracionPrecios) {
  const { error } = await supabase.from("productos").insert(productoParaDB(aplicarPrecioProductoActual(producto, precios), pedidoId));
  if (error) throw error;
}
export async function actualizarProducto(producto: Producto, precios?: ConfiguracionPrecios) {
  const final = precios ? aplicarPrecioProductoActual(producto, precios) : producto;
  const { error } = await supabase.from("productos").update(productoCamposDB(final)).eq("id", producto.id);
  if (error) throw error;
}
export async function eliminarProducto(productoId: number) {
  const { error } = await supabase.from("productos").delete().eq("id", productoId);
  if (error) throw error;
}
export async function actualizarEstadoProducto(productoId: number, campos: { pagado?: boolean; entregado?: boolean }) {
  const { error } = await supabase.from("productos").update(campos).eq("id", productoId);
  if (error) throw error;
}
