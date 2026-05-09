import { supabase } from "./supabase";
import type { Pedido, Producto } from "../types";

type ProductoDB = {
  id: number;
  pedido_id: number;
  cliente: string;
  nombre: string;
  talla: string;
  tipo: string;
  manga: string;
  personalizacion: boolean;
  nombre_personalizacion: string;
  numero_personalizacion: string;
  precio_venta_manual: number | null;
  coste_manual: number | null;
  pagado: boolean;
  entregado: boolean;
};

type PedidoDB = {
  id: number;
  nombre: string;
  fecha_pedido: string;
  productos: ProductoDB[];
};

const PRODUCTOS_SELECT = `
  id,
  pedido_id,
  cliente,
  nombre,
  talla,
  tipo,
  manga,
  personalizacion,
  nombre_personalizacion,
  numero_personalizacion,
  precio_venta_manual,
  coste_manual,
  pagado,
  entregado
`;

function productoDesdeDB(producto: ProductoDB): Producto {
  return {
    id: producto.id,
    cliente: producto.cliente,
    nombre: producto.nombre,
    talla: producto.talla as Producto["talla"],
    tipo: producto.tipo as Producto["tipo"],
    manga: producto.manga as Producto["manga"],
    personalizacion: producto.personalizacion,
    nombrePersonalizacion: producto.nombre_personalizacion,
    numeroPersonalizacion: producto.numero_personalizacion,
    precioVentaManual: Number(producto.precio_venta_manual ?? 0),
    costeManual: Number(producto.coste_manual ?? 0),
    pagado: producto.pagado,
    entregado: producto.entregado,
  };
}

function productoParaDB(producto: Producto, pedidoId: number) {
  return {
    pedido_id: pedidoId,
    cliente: producto.cliente,
    nombre: producto.nombre,
    talla: producto.talla,
    tipo: producto.tipo,
    manga: producto.manga,
    personalizacion:
      producto.tipo === "Otro" ? false : producto.personalizacion,
    nombre_personalizacion:
      producto.tipo === "Otro" ? "" : producto.nombrePersonalizacion,
    numero_personalizacion:
      producto.tipo === "Otro" ? "" : producto.numeroPersonalizacion,
    precio_venta_manual:
      producto.tipo === "Otro" ? producto.precioVentaManual : null,
    coste_manual: producto.tipo === "Otro" ? producto.costeManual : null,
    pagado: producto.pagado,
    entregado: producto.entregado,
  };
}

export async function cargarPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      nombre,
      fecha_pedido,
      productos (
        ${PRODUCTOS_SELECT}
      )
    `
    )
    .order("fecha_pedido", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PedidoDB[]).map((pedido) => ({
    id: pedido.id,
    nombre: pedido.nombre,
    fechaPedido: pedido.fecha_pedido,
    productos: pedido.productos.map(productoDesdeDB),
  }));
}

export async function crearPedidoConProductos(
  nombre: string,
  fechaPedido: string,
  productos: Producto[]
): Promise<Pedido> {
  const { data: pedidoCreado, error: errorPedido } = await supabase
    .from("pedidos")
    .insert({
      nombre,
      fecha_pedido: fechaPedido,
    })
    .select("id, nombre, fecha_pedido")
    .single();

  if (errorPedido) {
    throw errorPedido;
  }

  const productosParaInsertar = productos.map((producto) =>
    productoParaDB(producto, pedidoCreado.id)
  );

  const { data: productosCreados, error: errorProductos } = await supabase
    .from("productos")
    .insert(productosParaInsertar)
    .select(PRODUCTOS_SELECT);

  if (errorProductos) {
    throw errorProductos;
  }

  return {
    id: pedidoCreado.id,
    nombre: pedidoCreado.nombre,
    fechaPedido: pedidoCreado.fecha_pedido,
    productos: ((productosCreados ?? []) as ProductoDB[]).map(productoDesdeDB),
  };
}

export async function actualizarPedidoDB(
  pedidoId: number,
  nombre: string,
  fechaPedido: string
) {
  const { error } = await supabase
    .from("pedidos")
    .update({
      nombre,
      fecha_pedido: fechaPedido,
    })
    .eq("id", pedidoId);

  if (error) {
    throw error;
  }
}

export async function eliminarPedidoDB(pedidoId: number) {
  const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);

  if (error) {
    throw error;
  }
}

export async function actualizarProductoDB(producto: Producto) {
  const { error } = await supabase
    .from("productos")
    .update({
      cliente: producto.cliente,
      nombre: producto.nombre,
      talla: producto.talla,
      tipo: producto.tipo,
      manga: producto.manga,
      personalizacion:
        producto.tipo === "Otro" ? false : producto.personalizacion,
      nombre_personalizacion:
        producto.tipo === "Otro" ? "" : producto.nombrePersonalizacion,
      numero_personalizacion:
        producto.tipo === "Otro" ? "" : producto.numeroPersonalizacion,
      precio_venta_manual:
        producto.tipo === "Otro" ? producto.precioVentaManual : null,
      coste_manual: producto.tipo === "Otro" ? producto.costeManual : null,
      pagado: producto.pagado,
      entregado: producto.entregado,
    })
    .eq("id", producto.id);

  if (error) {
    throw error;
  }
}

export async function eliminarProductoDB(productoId: number) {
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", productoId);

  if (error) {
    throw error;
  }
}

export async function actualizarEstadoProductoDB(
  productoId: number,
  campos: {
    pagado?: boolean;
    entregado?: boolean;
  }
) {
  const { error } = await supabase
    .from("productos")
    .update(campos)
    .eq("id", productoId);

  if (error) {
    throw error;
  }
}