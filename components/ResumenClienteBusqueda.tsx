import { calcularProducto, formatoEuros } from "../lib/calculos";
import type { ConfiguracionPrecios, PedidoConTotales, Producto } from "../types";

type Props = {
  busqueda: string;
  pedidos: PedidoConTotales[];
  precios: ConfiguracionPrecios;
};

type ProductoConPedido = {
  pedidoId: number;
  pedidoNombre: string;
  producto: Producto;
};

export default function ResumenClienteBusqueda({
  busqueda,
  pedidos,
  precios,
}: Props) {
  const textoBusqueda = busqueda.trim().toLowerCase();

  if (!textoBusqueda) {
    return null;
  }

  const productosCliente: ProductoConPedido[] = pedidos.flatMap((pedido) =>
    pedido.productos
      .filter((producto) =>
        producto.cliente.toLowerCase().includes(textoBusqueda)
      )
      .map((producto) => ({
        pedidoId: pedido.id,
        pedidoNombre: pedido.nombre,
        producto,
      }))
  );

  if (productosCliente.length === 0) {
    return null;
  }

  const pedidosUnicos = new Set(
    productosCliente.map((item) => item.pedidoId)
  ).size;

  const productosPendientesPago = productosCliente.filter(
    (item) => !item.producto.pagado
  );

  const productosPendientesEntrega = productosCliente.filter(
    (item) => !item.producto.entregado
  );

  const ventaTotal = productosCliente.reduce((total, item) => {
    return total + calcularProducto(item.producto, precios).ventaTotal;
  }, 0);

  const costeTotalProductos = productosCliente.reduce((total, item) => {
    return total + calcularProducto(item.producto, precios).costeTotal;
  }, 0);

  const beneficioProductos = ventaTotal - costeTotalProductos;

  const pendienteCobro = productosPendientesPago.reduce((total, item) => {
    return total + calcularProducto(item.producto, precios).ventaTotal;
  }, 0);

  const pedidosConPendientePago = new Set(
    productosPendientesPago.map((item) => item.pedidoId)
  ).size;

  const pedidosConPendienteEntrega = new Set(
    productosPendientesEntrega.map((item) => item.pedidoId)
  ).size;

  return (
    <div className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-muted">
          Resumen de cliente
        </p>
        <h3 className="mt-1 text-xl font-bold">
          Resultados para “{busqueda.trim()}”
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="text-sm text-muted">Pedidos encontrados</p>
          <p className="mt-2 text-2xl font-bold">{pedidosUnicos}</p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="text-sm text-muted">Productos del cliente</p>
          <p className="mt-2 text-2xl font-bold">{productosCliente.length}</p>
        </div>

        <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Pendientes de pago</p>
          <p className="mt-2 text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {productosPendientesPago.length}
          </p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            En {pedidosConPendientePago} pedido
            {pedidosConPendientePago === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">Pendientes de entrega</p>
          <p className="mt-2 text-2xl font-bold text-red-800 dark:text-red-300">
            {productosPendientesEntrega.length}
          </p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            En {pedidosConPendienteEntrega} pedido
            {pedidosConPendienteEntrega === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="text-sm text-muted">Venta total cliente</p>
          <p className="mt-2 text-2xl font-bold">{formatoEuros(ventaTotal)}</p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="text-sm text-muted">Coste productos</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(costeTotalProductos)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="text-sm text-muted">Beneficio productos</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(beneficioProductos)}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/40 p-4">
          <p className="text-sm text-orange-700 dark:text-orange-300">Queda por cobrar</p>
          <p className="mt-2 text-2xl font-bold text-orange-800 dark:text-orange-300">
            {formatoEuros(pendienteCobro)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Este resumen cuenta solo los productos cuyo cliente coincide con la
        búsqueda. El coste fijo del pedido no se reparte por cliente.
      </p>
    </div>
  );
}