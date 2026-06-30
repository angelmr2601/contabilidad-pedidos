import type { ConfiguracionPrecios, Pedido, PedidoConTotales, Producto } from "@/types";
import { PRECIOS_POR_DEFECTO } from "./precios";

export function calcularProducto(producto: Producto, precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO) {
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
  const porTipo = {
    Fan: [precios.costeFan, precios.ventaFan],
    Player: [precios.costePlayer, precios.ventaPlayer],
    Retro: [precios.costeRetro, precios.ventaRetro],
    Personalizada: [producto.costeManual, producto.precioVentaManual],
    Infantil: [precios.costeInfantil, precios.ventaInfantil],
  } as const;
  let [costeTotal, ventaTotal] = porTipo[producto.tipo];
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

export function calcularPedidosConTotales(pedidos: Pedido[], precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO): PedidoConTotales[] {
  return pedidos.map((pedido) => {
    const totalVenta = pedido.productos.reduce((t, p) => t + calcularProducto(p, precios).ventaTotal, 0);
    const costeProductos = pedido.productos.reduce((t, p) => t + calcularProducto(p, precios).costeTotal, 0);
    const totalCoste = costeProductos + (pedido.costeFijoSnapshot ?? precios.costeFijoPedido);
    const pendienteCobro = pedido.productos.reduce((t, p) => t + (p.pagado ? 0 : calcularProducto(p, precios).ventaTotal), 0);
    return { ...pedido, totalVenta, costeProductos, totalCoste, beneficio: totalVenta - totalCoste, pendienteCobro, productosPendientesEntrega: pedido.productos.filter((p) => !p.entregado).length };
  });
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
