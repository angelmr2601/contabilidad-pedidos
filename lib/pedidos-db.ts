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
  venta_unidad_snapshot?: number | null;
  coste_unidad_snapshot?: number | null;
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
  coste_fijo_snapshot?: number | null;
  productos: ProductoDB[];
};

const PRODUCTOS_SELECT_BASE = `
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

const PRODUCTOS_SELECT_CON_SNAPSHOTS = `
  ${PRODUCTOS_SELECT_BASE},
  venta_unidad_snapshot,
  coste_unidad_snapshot
`;

function esErrorColumnaSnapshot(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mensaje = "message" in error ? String(error.message) : "";

  return (
    mensaje.includes("coste_fijo_snapshot") ||
    mensaje.includes("venta_unidad_snapshot") ||
    mensaje.includes("coste_unidad_snapshot")
  );
}

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
      producto.venta_unidad_snapshot == null
        ? null
        : Number(producto.venta_unidad_snapshot),
    costeUnidadSnapshot:
      producto.coste_unidad_snapshot == null
        ? null
        : Number(producto.coste_unidad_snapshot),
    pagado: producto.pagado,
    entregado: producto.entregado,
  };
}

function productoParaDB(
  producto: Producto,
  pedidoId: number,
  incluirSnapshots = true,
) {
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
    ...(incluirSnapshots
      ? {
          venta_unidad_snapshot: producto.ventaUnidadSnapshot,
          coste_unidad_snapshot: producto.costeUnidadSnapshot,
        }
      : {}),
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

async function cargarPedidosConSelect(incluirSnapshots: boolean) {
  return supabase
    .from("pedidos")
    .select(
      `
      id,
      nombre,
      fecha_pedido,
      numero_pedido,
      numero_seguimiento,
      archivado,
      ${incluirSnapshots ? "coste_fijo_snapshot," : ""}
      productos (
        ${incluirSnapshots ? PRODUCTOS_SELECT_CON_SNAPSHOTS : PRODUCTOS_SELECT_BASE}
      )
    `,
    )
    .order("fecha_pedido", { ascending: false })
    .order("id", { ascending: false });
}

export async function cargarPedidos(): Promise<Pedido[]> {
  const resultadoConSnapshots = await cargarPedidosConSelect(true);
  let data = resultadoConSnapshots.data as unknown as PedidoDB[] | null;
  let error: unknown = resultadoConSnapshots.error;

  if (error && esErrorColumnaSnapshot(error)) {
    const resultadoSinSnapshots = await cargarPedidosConSelect(false);
    data = resultadoSinSnapshots.data as unknown as PedidoDB[] | null;
    error = resultadoSinSnapshots.error;
  }

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PedidoDB[]).map((pedido) => ({
    id: pedido.id,
    nombre: pedido.nombre,
    fechaPedido: pedido.fecha_pedido,
    numeroPedido: pedido.numero_pedido ?? "",
    numeroSeguimiento: pedido.numero_seguimiento ?? "",
    archivado: pedido.archivado,
    costeFijoSnapshot:
      pedido.coste_fijo_snapshot == null
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

  const pedidoBase = {
    nombre,
    fecha_pedido: fechaPedido,
    numero_pedido: numeroPedido.trim() || null,
    numero_seguimiento: numeroSeguimiento.trim() || null,
    archivado,
  };

  let {
    data: pedidoCreado,
    error: errorPedido,
  }: {
    data: PedidoDB | null;
    error: unknown;
  } = await supabase
    .from("pedidos")
    .insert({
      ...pedidoBase,
      coste_fijo_snapshot: precios.costeFijoPedido,
    })
    .select(
      "id, nombre, fecha_pedido, numero_pedido, numero_seguimiento, archivado, coste_fijo_snapshot",
    )
    .single();

  if (errorPedido && esErrorColumnaSnapshot(errorPedido)) {
    const resultadoSinSnapshots = await supabase
      .from("pedidos")
      .insert(pedidoBase)
      .select(
        "id, nombre, fecha_pedido, numero_pedido, numero_seguimiento, archivado",
      )
      .single();

    pedidoCreado = resultadoSinSnapshots.data as PedidoDB | null;
    errorPedido = resultadoSinSnapshots.error;
  }

  if (errorPedido) {
    throw errorPedido;
  }

  if (!pedidoCreado) {
    throw new Error("No se pudo crear el pedido.");
  }

  let productosParaInsertar = productosConPrecios.map((producto) =>
    productoParaDB(producto, pedidoCreado.id),
  );

  let {
    data: productosCreados,
    error: errorProductos,
  }: {
    data: ProductoDB[] | null;
    error: unknown;
  } = await supabase
    .from("productos")
    .insert(productosParaInsertar)
    .select(PRODUCTOS_SELECT_CON_SNAPSHOTS);

  if (errorProductos && esErrorColumnaSnapshot(errorProductos)) {
    productosParaInsertar = productosConPrecios.map((producto) =>
      productoParaDB(producto, pedidoCreado.id, false),
    );

    const resultadoSinSnapshots = await supabase
      .from("productos")
      .insert(productosParaInsertar)
      .select(PRODUCTOS_SELECT_BASE);

    productosCreados = resultadoSinSnapshots.data as ProductoDB[] | null;
    errorProductos = resultadoSinSnapshots.error;
  }

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
      pedidoCreado.coste_fijo_snapshot == null
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
  const productoConPrecio = precios
    ? aplicarPrecioProductoActual(producto, precios)
    : producto;

  let {
    data,
    error,
  }: {
    data: ProductoDB | null;
    error: unknown;
  } = await supabase
    .from("productos")
    .insert(productoParaDB(productoConPrecio, pedidoId))
    .select(PRODUCTOS_SELECT_CON_SNAPSHOTS)
    .single();

  if (error && esErrorColumnaSnapshot(error)) {
    const resultadoSinSnapshots = await supabase
      .from("productos")
      .insert(productoParaDB(productoConPrecio, pedidoId, false))
      .select(PRODUCTOS_SELECT_BASE)
      .single();

    data = resultadoSinSnapshots.data as ProductoDB | null;
    error = resultadoSinSnapshots.error;
  }

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
