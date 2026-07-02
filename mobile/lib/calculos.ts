import type { BorradorPedido, ConfiguracionPrecios, Pedido, PedidoConTotales, Producto } from "@/types";
import { PRECIOS_POR_DEFECTO } from "./precios";

export type TotalesProducto = {
  costeUnidad: number;
  ventaUnidad: number;
  costeTotal: number;
  ventaTotal: number;
  beneficio: number;
};

const precioPorTipo = (producto: Producto, precios: ConfiguracionPrecios) => ({
  Fan: [precios.costeFan, precios.ventaFan],
  Player: [precios.costePlayer, precios.ventaPlayer],
  Retro: [precios.costeRetro, precios.ventaRetro],
  Personalizada: [producto.costeManual, producto.precioVentaManual],
  Infantil: [precios.costeInfantil, precios.ventaInfantil],
} as const)[producto.tipo];

export function calcularProducto(producto: Producto, precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): TotalesProducto {
  if (producto.tipo !== "Personalizada" && producto.costeUnidadSnapshot !== null && producto.ventaUnidadSnapshot !== null) {
    const costeTotal = producto.costeUnidadSnapshot;
    const ventaTotal = producto.ventaUnidadSnapshot;
    return { costeUnidad: costeTotal, ventaUnidad: ventaTotal, costeTotal, ventaTotal, beneficio: ventaTotal - costeTotal };
  }

  if (producto.tipo === "Personalizada") {
    const tienePrecioManual = producto.costeManual > 0 || producto.precioVentaManual > 0;
    const costeTotal = tienePrecioManual || producto.costeUnidadSnapshot === null ? producto.costeManual : producto.costeUnidadSnapshot;
    const ventaTotal = tienePrecioManual || producto.ventaUnidadSnapshot === null ? producto.precioVentaManual : producto.ventaUnidadSnapshot;
    return { costeUnidad: costeTotal, ventaUnidad: ventaTotal, costeTotal, ventaTotal, beneficio: ventaTotal - costeTotal };
  }

  let [costeTotal, ventaTotal] = precioPorTipo(producto, precios);
  if (producto.personalizacion) { costeTotal += precios.costePersonalizacion; ventaTotal += precios.ventaPersonalizacion; }
  if (producto.parche) { costeTotal += precios.costeParche; ventaTotal += precios.ventaParche; }
  if (producto.mangaLarga) { costeTotal += precios.costeMangaLarga; ventaTotal += precios.ventaMangaLarga; }

  return { costeUnidad: costeTotal, ventaUnidad: ventaTotal, costeTotal, ventaTotal, beneficio: ventaTotal - costeTotal };
}

export function aplicarPrecioProductoActual(producto: Producto, precios: ConfiguracionPrecios): Producto {
  const precio = calcularProducto({ ...producto, costeUnidadSnapshot: null, ventaUnidadSnapshot: null }, precios);
  return { ...producto, costeUnidadSnapshot: precio.costeUnidad, ventaUnidadSnapshot: precio.ventaUnidad };
}

export function calcularArchivadoPedido(productos: Producto[]): boolean {
  return productos.length > 0 && productos.every((producto) => producto.pagado && producto.entregado);
}

export function calcularPendientesPago(productos: Producto[], precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): number {
  return productos.reduce((total, producto) => total + (producto.pagado ? 0 : calcularProducto(producto, precios).ventaTotal), 0);
}

export function calcularPendientesEntrega(productos: Producto[]): number {
  return productos.filter((producto) => !producto.entregado).length;
}

export function calcularPedido(pedido: Pedido, precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): PedidoConTotales {
  const totales = pedido.productos.map((producto) => calcularProducto(producto, precios));
  const totalVenta = totales.reduce((total, producto) => total + producto.ventaTotal, 0);
  const costeProductos = totales.reduce((total, producto) => total + producto.costeTotal, 0);
  const totalCoste = costeProductos + (pedido.costeFijoSnapshot ?? precios.costeFijoPedido);

  return {
    ...pedido,
    totalVenta,
    costeProductos,
    totalCoste,
    beneficio: totalVenta - totalCoste,
    pendienteCobro: calcularPendientesPago(pedido.productos, precios),
    productosPendientesEntrega: calcularPendientesEntrega(pedido.productos),
  };
}

export function calcularPedidosConTotales(pedidos: Pedido[], precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): PedidoConTotales[] {
  return pedidos.map((pedido) => calcularPedido(pedido, precios));
}

export function calcularBorrador(pedido: BorradorPedido, precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): PedidoConTotales {
  return calcularPedido(pedido, precios);
}

export function calcularResumen(pedidos: PedidoConTotales[]) {
  return pedidos.reduce((acc, pedido) => ({
    ventas: acc.ventas + pedido.totalVenta,
    costes: acc.costes + pedido.totalCoste,
    beneficio: acc.beneficio + pedido.beneficio,
    pendienteCobro: acc.pendienteCobro + pedido.pendienteCobro,
    productosPendientesEntrega: acc.productosPendientesEntrega + pedido.productosPendientesEntrega,
  }), { ventas: 0, costes: 0, beneficio: 0, pendienteCobro: 0, productosPendientesEntrega: 0 });
}

export const formatoEuros = (valor: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(valor);
export const formatoFecha = (fecha: string) => fecha ? new Intl.DateTimeFormat("es-ES").format(new Date(`${fecha}T00:00:00`)) : "Sin fecha";
