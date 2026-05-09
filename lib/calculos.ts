import type { Pedido, PedidoConTotales, Producto } from "../types";

export const COSTE_FIJO_PEDIDO = 4;

export function calcularProducto(producto: Producto) {
  let costeUnidad = producto.tipo === "Fan" ? 6.5 : 9.4;
  let ventaUnidad = producto.tipo === "Fan" ? 15 : 18;

  if (producto.personalizacion) {
    costeUnidad += 2;
    ventaUnidad += 2;
  }

  if (producto.manga === "Larga") {
    costeUnidad += 2;
    ventaUnidad += 2;
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
  pedidos: Pedido[]
): PedidoConTotales[] {
  return pedidos.map((pedido: Pedido) => {
    const totalVenta = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto).ventaTotal,
      0
    );

    const costeProductos = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto).costeTotal,
      0
    );

    const totalCoste = costeProductos + COSTE_FIJO_PEDIDO;
    const beneficio = totalVenta - totalCoste;

    const pendienteCobro = pedido.productos.reduce(
      (total: number, producto: Producto) => {
        const calculo = calcularProducto(producto);
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