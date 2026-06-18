import { supabase } from "./supabase";
import type { ConfiguracionPrecios, Pedido, Producto } from "../types";
import { aplicarPrecioProductoActual } from "./calculos";

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
  venta_unidad_snapshot: number | null;
  coste_unidad_snapshot: number | null;
  pagado: boolean;
  entregado: boolean;
};

type PedidoDB = {
  id: number;
  nombre: string;
  fecha_pedido: string;
  numero_pedido: string | null;
  numero_seguimiento: string | null;
  archivado: boolean;
  coste_fijo_snapshot: number | null;
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
  venta_unidad_snapshot,
  coste_unidad_snapshot,
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
    ventaUnidadSnapshot:
      producto.venta_unidad_snapshot === null
        ? null
        : Number(producto.venta_unidad_snapshot),
    costeUnidadSnapshot:
      producto.coste_unidad_snapshot === null
        ? null
        : Number(producto.coste_unidad_snapshot),
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
    venta_unidad_snapshot: producto.ventaUnidadSnapshot,
    coste_unidad_snapshot: producto.costeUnidadSnapshot,
    pagado: producto.pagado,
    entregado: producto.entregado,
  };
}

export function calcularArchivadoPedido(productos: Producto[]) {
  return (
    productos.length > 0 &&
    productos.every((producto) => producto.pagado && producto.entregado)
  );
}

export async function cargarPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      nombre,
      fecha_pedido,
      numero_pedido,
      numero_seguimiento,
      archivado,
      coste_fijo_snapshot,
      productos (
        ${PRODUCTOS_SELECT}
      )
    `,
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
    numeroPedido: pedido.numero_pedido ?? "",
    numeroSeguimiento: pedido.numero_seguimiento ?? "",
    archivado: pedido.archivado,
    costeFijoSnapshot:
      pedido.coste_fijo_snapshot === null
        ? null
        : Number(pedido.coste_fijo_snapshot),
    productos: pedido.productos.map(productoDesdeDB),
  }));
}

export async function crearPedidoConProductos(
  nombre: string,
  fechaPedido: string,
  numeroPedido: string,
  numeroSeguimiento: string,
  productos: Producto[],
  precios: ConfiguracionPrecios,
): Promise<Pedido> {
  const productosConPrecios = productos.map((producto) =>
    aplicarPrecioProductoActual(producto, precios),
  );
  const archivado = calcularArchivadoPedido(productosConPrecios);

  const { data: pedidoCreado, error: errorPedido } = await supabase
    .from("pedidos")
    .insert({
      nombre,
      fecha_pedido: fechaPedido,
      numero_pedido: numeroPedido.trim() || null,
      numero_seguimiento: numeroSeguimiento.trim() || null,
      archivado,
      coste_fijo_snapshot: precios.costeFijoPedido,
    })
    .select(
      "id, nombre, fecha_pedido, numero_pedido, numero_seguimiento, archivado, coste_fijo_snapshot",
    )
    .single();

  if (errorPedido) {
    throw errorPedido;
  }

  const productosParaInsertar = productosConPrecios.map((producto) =>
    productoParaDB(producto, pedidoCreado.id),
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
    numeroPedido: pedidoCreado.numero_pedido ?? "",
    numeroSeguimiento: pedidoCreado.numero_seguimiento ?? "",
    archivado: pedidoCreado.archivado,
    costeFijoSnapshot:
      pedidoCreado.coste_fijo_snapshot === null
        ? null
        : Number(pedidoCreado.coste_fijo_snapshot),
    productos: ((productosCreados ?? []) as ProductoDB[]).map(productoDesdeDB),
  };
}

export async function crearProductoEnPedido(
  pedidoId: number,
  producto: Producto,
  precios?: ConfiguracionPrecios,
): Promise<Producto> {
  const { data, error } = await supabase
    .from("productos")
    .insert(
      productoParaDB(
        precios ? aplicarPrecioProductoActual(producto, precios) : producto,
        pedidoId,
      ),
    )
    .select(PRODUCTOS_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return productoDesdeDB(data as ProductoDB);
}

export async function actualizarPedidoDB(
  pedidoId: number,
  nombre: string,
  fechaPedido: string,
  numeroPedido: string,
  numeroSeguimiento: string,
) {
  const { error } = await supabase
    .from("pedidos")
    .update({
      nombre,
      fecha_pedido: fechaPedido,
      numero_pedido: numeroPedido.trim() || null,
      numero_seguimiento: numeroSeguimiento.trim() || null,
    })
    .eq("id", pedidoId);

  if (error) {
    throw error;
  }
}

export async function actualizarArchivadoPedidoDB(
  pedidoId: number,
  archivado: boolean,
) {
  const { error } = await supabase
    .from("pedidos")
    .update({ archivado })
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
      venta_unidad_snapshot: producto.ventaUnidadSnapshot,
      coste_unidad_snapshot: producto.costeUnidadSnapshot,
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
  },
) {
  const { error } = await supabase
    .from("productos")
    .update(campos)
    .eq("id", productoId);

  if (error) {
    throw error;
  }
}

export async function marcarTodosProductosPedidoDB(
  pedidoId: number,
  campo: "pagado" | "entregado",
) {
  const { error } = await supabase
    .from("productos")
    .update({ [campo]: true })
    .eq("pedido_id", pedidoId)
    .eq(campo, false);

  if (error) {
    throw error;
  }
}
