import type { PedidoConTotales } from "../types";

type Props = {
  pedidos: PedidoConTotales[];
};

export default function ResumenDetalle({ pedidos }: Props) {
  const totalPedidos = pedidos.length;

  const totalProductos = pedidos.reduce(
    (total, pedido) => total + pedido.productos.length,
    0
  );

  const productosPagados = pedidos.reduce(
    (total, pedido) =>
      total + pedido.productos.filter((producto) => producto.pagado).length,
    0
  );

  const productosPendientesPago = pedidos.reduce(
    (total, pedido) =>
      total + pedido.productos.filter((producto) => !producto.pagado).length,
    0
  );

  const productosEntregados = pedidos.reduce(
    (total, pedido) =>
      total + pedido.productos.filter((producto) => producto.entregado).length,
    0
  );

  const productosPendientesEntrega = pedidos.reduce(
    (total, pedido) =>
      total + pedido.productos.filter((producto) => !producto.entregado).length,
    0
  );

  const tarjetas = [
    {
      titulo: "Pedidos del periodo",
      valor: totalPedidos,
    },
    {
      titulo: "Productos vendidos",
      valor: totalProductos,
    },
    {
      titulo: "Productos pagados",
      valor: productosPagados,
    },
    {
      titulo: "Pendientes de pago",
      valor: productosPendientesPago,
    },
    {
      titulo: "Productos entregados",
      valor: productosEntregados,
    },
    {
      titulo: "Pendientes de entrega",
      valor: productosPendientesEntrega,
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Detalle del periodo</h3>
        <p className="text-sm text-muted">
          Resumen operativo de pedidos, productos, pagos y entregas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.titulo}
            className="rounded-2xl bg-surface-muted p-5"
          >
            <p className="text-sm text-muted">{tarjeta.titulo}</p>
            <p className="mt-2 text-2xl font-bold">{tarjeta.valor}</p>
          </div>
        ))}
      </div>
    </section>
  );
}