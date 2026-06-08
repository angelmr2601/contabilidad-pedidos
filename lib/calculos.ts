import type {
  ConfiguracionPrecios,
  Pedido,
  PedidoConTotales,
  Producto,
} from "../types";
import { PRECIOS_POR_DEFECTO } from "./precios";

export function calcularProducto(
  producto: Producto,
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO
) {
  let costeUnidad = 0;
  let ventaUnidad = 0;

  if (producto.tipo === "Fan") {
    costeUnidad = precios.costeFan;
    ventaUnidad = precios.ventaFan;
  }

  if (producto.tipo === "Retro/Player") {
    costeUnidad = precios.costeRetroPlayer;
    ventaUnidad = precios.ventaRetroPlayer;
  }

  if (producto.tipo === "Otro") {
    costeUnidad = producto.costeManual || 0;
    ventaUnidad = producto.precioVentaManual || 0;
  }

  if (producto.tipo !== "Otro") {
    if (producto.personalizacion) {
      costeUnidad += precios.costePersonalizacion;
      ventaUnidad += precios.ventaPersonalizacion;
    }

    if (producto.manga === "Larga") {
      costeUnidad += precios.costeMangaLarga;
      ventaUnidad += precios.ventaMangaLarga;
    }
  }

  const costeTotal = costeUnidad;
  const ventaTotal = ventaUnidad;
  const beneficio = ventaTotal - costeTotal;

  return {
    costeUnidad,
    ventaUnidad,
    costeTotal,
    ventaTotal,
    beneficio,
  };
}

export function calcularPedidosConTotales(
  pedidos: Pedido[],
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO
): PedidoConTotales[] {
  return pedidos.map((pedido: Pedido) => {
    const totalVenta = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto, precios).ventaTotal,
      0
    );

    const costeProductos = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto, precios).costeTotal,
      0
    );

    const totalCoste = costeProductos + precios.costeFijoPedido;
    const beneficio = totalVenta - totalCoste;

    const pendienteCobro = pedido.productos.reduce(
      (total: number, producto: Producto) => {
        const calculo = calcularProducto(producto, precios);
        return total + (producto.pagado ? 0 : calculo.ventaTotal);
      },
      0
    );

    const productosPendientesPago = pedido.productos.filter(
      (producto: Producto) => !producto.pagado
    ).length;

    const productosPendientesEntrega = pedido.productos.filter(
      (producto: Producto) => !producto.entregado
    ).length;

    return {
      ...pedido,
      totalVenta,
      costeProductos,
      totalCoste,
      beneficio,
      pendienteCobro,
      productosPendientesPago,
      productosPendientesEntrega,
    };
  });
}

export function calcularResumen(pedidos: PedidoConTotales[]) {
  return pedidos.reduce(
    (acc, pedido) => {
      acc.ventas += pedido.totalVenta;
      acc.costes += pedido.totalCoste;
      acc.beneficio += pedido.beneficio;
      acc.pendienteCobro += pedido.pendienteCobro;
      acc.productosPendientesEntrega += pedido.productosPendientesEntrega;

      return acc;
    },
    {
      ventas: 0,
      costes: 0,
      beneficio: 0,
      pendienteCobro: 0,
      productosPendientesEntrega: 0,
    }
  );
}

export function formatoEuros(valor: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}

export function formatoFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${fecha}T00:00:00`));
}