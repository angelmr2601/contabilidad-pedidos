import type {
  ConfiguracionPrecios,
  Pedido,
  PedidoConTotales,
  Producto,
} from "../types";
import { calcularGastoEnvioPedido } from "./gastos-envio";
import { PRECIOS_POR_DEFECTO } from "./precios";

export function calcularPrecioProductoDesdeConfiguracion(
  producto: Producto,
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO,
) {
  let costeUnidad = 0;
  let ventaUnidad = 0;

  if (producto.tipo === "Fan") {
    costeUnidad = precios.costeFan;
    ventaUnidad = precios.ventaFan;
  }

  if (producto.tipo === "Player") {
    costeUnidad = precios.costePlayer;
    ventaUnidad = precios.ventaPlayer;
  }

  if (producto.tipo === "Retro") {
    costeUnidad = precios.costeRetro;
    ventaUnidad = precios.ventaRetro;
  }

  if (producto.tipo === "Personalizada") {
    costeUnidad = producto.costeManual;
    ventaUnidad = producto.precioVentaManual;
  }

  if (producto.tipo === "Infantil") {
    costeUnidad = precios.costeInfantil;
    ventaUnidad = precios.ventaInfantil;
  }

  if (producto.personalizacion) {
    costeUnidad += precios.costePersonalizacion;
    ventaUnidad += precios.ventaPersonalizacion;
  }

  if (producto.parche) {
    costeUnidad += precios.costeParche;
    ventaUnidad += precios.ventaParche;
  }

  if (producto.mangaLarga) {
    costeUnidad += precios.costeMangaLarga;
    ventaUnidad += precios.ventaMangaLarga;
  }

  if (producto.talla === "3XL") {
    costeUnidad += precios.costeTalla3XL;
    ventaUnidad += precios.ventaTalla3XL;
  }

  if (producto.talla === "4XL") {
    costeUnidad += precios.costeTalla4XL;
    ventaUnidad += precios.ventaTalla4XL;
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

export function calcularProducto(
  producto: Producto,
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO,
) {
  if (
    producto.costeUnidadSnapshot !== null &&
    producto.ventaUnidadSnapshot !== null
  ) {
    const costeUnidad = producto.costeUnidadSnapshot;
    const ventaUnidad = producto.ventaUnidadSnapshot;
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

  return calcularPrecioProductoDesdeConfiguracion(producto, precios);
}

export function aplicarPrecioProductoActual(
  producto: Producto,
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO,
): Producto {
  const calculo = calcularPrecioProductoDesdeConfiguracion(producto, precios);

  return {
    ...producto,
    costeUnidadSnapshot: calculo.costeUnidad,
    ventaUnidadSnapshot: calculo.ventaUnidad,
  };
}

export function calcularGastoEnvioPedidoSnapshot(pedido: Pedido) {
  if (!pedido.incluirGastosEnvio) {
    return 0;
  }

  return (
    pedido.gastoEnvioSnapshot ??
    calcularGastoEnvioPedido(pedido.productos.length)
  );
}

export function calcularPedidosConTotales(
  pedidos: Pedido[],
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO,
): PedidoConTotales[] {
  return pedidos.map((pedido: Pedido) => {
    const totalVenta = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto, precios).ventaTotal,
      0,
    );

    const costeProductos = pedido.productos.reduce(
      (total: number, producto: Producto) =>
        total + calcularProducto(producto, precios).costeTotal,
      0,
    );

    const costeFijoPedido = pedido.costeFijoSnapshot ?? precios.costeFijoPedido;
    const gastoEnvio = calcularGastoEnvioPedidoSnapshot(pedido);
    const totalCoste = costeProductos + costeFijoPedido + gastoEnvio;
    const beneficio = totalVenta - totalCoste;

    const pendienteCobro = pedido.productos.reduce(
      (total: number, producto: Producto) => {
        const calculo = calcularProducto(producto, precios);
        return total + (producto.pagado ? 0 : calculo.ventaTotal);
      },
      0,
    );

    const productosPendientesPago = pedido.productos.filter(
      (producto: Producto) => !producto.pagado,
    ).length;

    const productosPendientesEntrega = pedido.productos.filter(
      (producto: Producto) => !producto.entregado,
    ).length;

    return {
      ...pedido,
      totalVenta,
      costeProductos,
      totalCoste,
      gastoEnvio,
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
    },
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
