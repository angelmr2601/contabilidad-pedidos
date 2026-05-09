import {
  COSTE_FIJO_PEDIDO,
  calcularProducto,
  formatoEuros,
  formatoFecha,
} from "../lib/calculos";
import type { Pedido, PedidoConTotales, Producto } from "../types";

type Props = {
  pedido: PedidoConTotales;
  abierto: boolean;
  onCambiarAbierto: (id: number) => void;
  onEditarPedido: (pedido: Pedido) => void;
  onEliminarPedido: (pedidoId: number) => void;
  onAñadirProducto: (pedido: Pedido) => void;
  onEditarProducto: (pedidoId: number, producto: Producto) => void;
  onEliminarProducto: (pedidoId: number, productoId: number) => void;
  onAlternarPagoProducto: (pedidoId: number, productoId: number) => void;
  onAlternarEntregaProducto: (pedidoId: number, productoId: number) => void;
};

export default function PedidoCard({
  pedido,
  abierto,
  onCambiarAbierto,
  onEditarPedido,
  onEliminarPedido,
  onAñadirProducto,
  onEditarProducto,
  onEliminarProducto,
  onAlternarPagoProducto,
  onAlternarEntregaProducto,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200">
      <div className="flex flex-col gap-4 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => onCambiarAbierto(pedido.id)}
          className="flex flex-1 flex-col gap-4 text-left md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
              <span className="text-lg">{abierto ? "−" : "+"}</span>
            </div>

            <p className="mt-1 font-medium">{pedido.nombre}</p>

            <p className="mt-1 text-sm text-neutral-500">
              Fecha: {formatoFecha(pedido.fechaPedido)}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              {pedido.productos.length} producto
              {pedido.productos.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5 md:text-right">
            <div>
              <p className="text-neutral-500">Venta</p>
              <p className="font-bold">{formatoEuros(pedido.totalVenta)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Coste</p>
              <p className="font-bold">{formatoEuros(pedido.totalCoste)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Beneficio</p>
              <p className="font-bold">{formatoEuros(pedido.beneficio)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Sin pagar</p>
              <p className="font-bold">{pedido.productosPendientesPago}</p>
            </div>

            <div>
              <p className="text-neutral-500">Sin entregar</p>
              <p className="font-bold">{pedido.productosPendientesEntrega}</p>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap gap-2 md:ml-4">
          <button
            type="button"
            onClick={() => onAñadirProducto(pedido)}
            className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white"
          >
            Añadir producto
          </button>

          <button
            type="button"
            onClick={() => onEditarPedido(pedido)}
            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
          >
            Editar pedido
          </button>

          <button
            type="button"
            onClick={() => onEliminarPedido(pedido.id)}
            className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
          >
            Eliminar pedido
          </button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-5">
          <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-neutral-500">Coste productos</p>
              <p className="font-bold">{formatoEuros(pedido.costeProductos)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Coste fijo pedido</p>
              <p className="font-bold">{formatoEuros(COSTE_FIJO_PEDIDO)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Coste total</p>
              <p className="font-bold">{formatoEuros(pedido.totalCoste)}</p>
            </div>

            <div>
              <p className="text-neutral-500">Beneficio pedido</p>
              <p className="font-bold">{formatoEuros(pedido.beneficio)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-neutral-500">
                  <th className="py-3 pl-4 pr-4">Cliente</th>
                  <th className="py-3 pr-4">Producto</th>
                  <th className="py-3 pr-4">Talla</th>
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4">Manga</th>
                  <th className="py-3 pr-4">Pers.</th>
                  <th className="py-3 pr-4">Venta</th>
                  <th className="py-3 pr-4">Coste</th>
                  <th className="py-3 pr-4">Beneficio producto</th>
                  <th className="py-3 pr-4">Pago</th>
                  <th className="py-3 pr-4">Entrega</th>
                  <th className="py-3 pr-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pedido.productos.map((producto) => {
                  const calculo = calcularProducto(producto);

                  return (
                    <tr key={producto.id} className="border-b last:border-none">
                      <td className="py-4 pl-4 pr-4 font-medium">
                        {producto.cliente}
                      </td>

                      <td className="py-4 pr-4">{producto.nombre}</td>

                      <td className="py-4 pr-4">{producto.talla}</td>

                      <td className="py-4 pr-4">{producto.tipo}</td>

                      <td className="py-4 pr-4">{producto.manga}</td>

                      <td className="py-4 pr-4">
                        {producto.personalizacion ? (
                          <div>
                            <p className="font-medium">Sí</p>
                            <p className="text-xs text-neutral-500">
                              {producto.nombrePersonalizacion || "Sin nombre"}{" "}
                              {producto.numeroPersonalizacion &&
                                `#${producto.numeroPersonalizacion}`}
                            </p>
                          </div>
                        ) : (
                          "No"
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        {formatoEuros(calculo.ventaTotal)}
                      </td>

                      <td className="py-4 pr-4">
                        {formatoEuros(calculo.costeTotal)}
                      </td>

                      <td className="py-4 pr-4 font-semibold">
                        {formatoEuros(calculo.beneficio)}
                      </td>

                      <td className="py-4 pr-4">
                        <button
                          type="button"
                          onClick={() =>
                            onAlternarPagoProducto(pedido.id, producto.id)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            producto.pagado
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {producto.pagado ? "Pagado" : "Pendiente"}
                        </button>
                      </td>

                      <td className="py-4 pr-4">
                        <button
                          type="button"
                          onClick={() =>
                            onAlternarEntregaProducto(pedido.id, producto.id)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            producto.entregado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {producto.entregado ? "Entregado" : "Pendiente"}
                        </button>
                      </td>

                      <td className="py-4 pr-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEditarProducto(pedido.id, producto)}
                            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onEliminarProducto(pedido.id, producto.id)
                            }
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}