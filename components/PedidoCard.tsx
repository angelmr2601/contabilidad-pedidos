"use client";

import { useState } from "react";

import {
  calcularProducto,
  formatoEuros,
  formatoFecha,
} from "../lib/calculos";
import type {
  ConfiguracionPrecios,
  Pedido,
  PedidoConTotales,
  Producto,
} from "../types";

type Props = {
  pedido: PedidoConTotales;
  precios: ConfiguracionPrecios;
  abierto: boolean;
  onCambiarAbierto: (id: number) => void;
  onEditarPedido: (pedido: Pedido) => void;
  onEliminarPedido: (pedidoId: number) => void;
  onAñadirProducto: (pedido: Pedido) => void;
  onDuplicarProducto: (pedidoId: number, producto: Producto) => void;
  onEditarProducto: (pedidoId: number, producto: Producto) => void;
  onEliminarProducto: (pedidoId: number, productoId: number) => void;
  onAlternarPagoProducto: (pedidoId: number, productoId: number) => void;
  onAlternarEntregaProducto: (pedidoId: number, productoId: number) => void;
  onMarcarTodoPagado: (pedidoId: number) => void;
  onMarcarTodoEntregado: (pedidoId: number) => void;
};

export default function PedidoCard({
  pedido,
  precios,
  abierto,
  onCambiarAbierto,
  onEditarPedido,
  onEliminarPedido,
  onAñadirProducto,
  onDuplicarProducto,
  onEditarProducto,
  onEliminarProducto,
  onAlternarPagoProducto,
  onAlternarEntregaProducto,
  onMarcarTodoPagado,
  onMarcarTodoEntregado,
}: Props) {
  const [productoMovilAbierto, setProductoMovilAbierto] =
    useState<number | null>(null);

  function cambiarProductoMovilAbierto(productoId: number) {
    setProductoMovilAbierto((actual) =>
      actual === productoId ? null : productoId
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        pedido.archivado ? "border-green-200 dark:border-green-900" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-4 bg-surface p-5 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => onCambiarAbierto(pedido.id)}
          className="flex flex-1 flex-col gap-4 text-left md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>

              {pedido.archivado && (
                <span className="rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                  Archivado
                </span>
              )}

              <span className="text-lg">{abierto ? "−" : "+"}</span>
            </div>

            <p className="mt-1 font-medium">{pedido.nombre}</p>

            <p className="mt-1 text-sm text-muted">
              Fecha: {formatoFecha(pedido.fechaPedido)}
            </p>

            <p className="mt-1 text-sm text-muted">
              {pedido.productos.length} producto
              {pedido.productos.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5 md:text-right">
            <div>
              <p className="text-muted">Venta</p>
              <p className="font-bold">{formatoEuros(pedido.totalVenta)}</p>
            </div>

            <div>
              <p className="text-muted">Coste</p>
              <p className="font-bold">{formatoEuros(pedido.totalCoste)}</p>
            </div>

            <div>
              <p className="text-muted">Beneficio</p>
              <p className="font-bold">{formatoEuros(pedido.beneficio)}</p>
            </div>

            <div>
              <p className="text-muted">Sin pagar</p>
              <p className="font-bold">{pedido.productosPendientesPago}</p>
            </div>

            <div>
              <p className="text-muted">Sin entregar</p>
              <p className="font-bold">{pedido.productosPendientesEntrega}</p>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap gap-2 md:ml-4">
          {pedido.productosPendientesPago > 0 && (
            <button
              type="button"
              onClick={() => onMarcarTodoPagado(pedido.id)}
              className="rounded-full bg-yellow-100 dark:bg-yellow-950 px-3 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300"
            >
              Marcar todo pagado
            </button>
          )}

          {pedido.productosPendientesEntrega > 0 && (
            <button
              type="button"
              onClick={() => onMarcarTodoEntregado(pedido.id)}
              className="rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-xs font-medium text-red-800 dark:text-red-300"
            >
              Marcar todo entregado
            </button>
          )}

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
            className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-muted"
          >
            Editar pedido
          </button>

          <button
            type="button"
            onClick={() => onEliminarPedido(pedido.id)}
            className="rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300"
          >
            Eliminar pedido
          </button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-border bg-surface-muted p-5">
          <div className="space-y-3 md:hidden">
            {pedido.productos.map((producto, index) => {
              const calculo = calcularProducto(producto, precios);
              const productoAbierto = productoMovilAbierto === producto.id;

              return (
                <div
                  key={producto.id}
                  className="overflow-hidden rounded-2xl bg-surface shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => cambiarProductoMovilAbierto(producto.id)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  >
                    <div>
                      <p className="text-xs font-medium text-muted">
                        Producto {index + 1} · {producto.cliente}
                      </p>

                      <h4 className="mt-1 font-bold">{producto.nombre}</h4>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-muted">
                          {producto.tipo}
                        </span>

                        <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-muted">
                          Talla {producto.talla}
                        </span>

                        {!producto.pagado && (
                          <span className="rounded-full bg-yellow-100 dark:bg-yellow-950 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                            Pendiente pago
                          </span>
                        )}

                        {!producto.entregado && (
                          <span className="rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                            Pendiente entrega
                          </span>
                        )}

                        {producto.pagado && producto.entregado && (
                          <span className="rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                            Completo
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-lg">{productoAbierto ? "−" : "+"}</span>
                  </button>

                  {productoAbierto && (
                    <div className="border-t border-border p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Cliente</p>
                          <p className="font-semibold">{producto.cliente}</p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Talla</p>
                          <p className="font-semibold">{producto.talla}</p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Tipo</p>
                          <p className="font-semibold">{producto.tipo}</p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Manga</p>
                          <p className="font-semibold">{producto.manga}</p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Venta</p>
                          <p className="font-semibold">
                            {formatoEuros(calculo.ventaTotal)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Coste</p>
                          <p className="font-semibold">
                            {formatoEuros(calculo.costeTotal)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Beneficio</p>
                          <p className="font-semibold">
                            {formatoEuros(calculo.beneficio)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-muted p-3">
                          <p className="text-muted">Personalización</p>
                          {producto.personalizacion ? (
                            <p className="font-semibold">
                              {producto.nombrePersonalizacion || "Sin nombre"}{" "}
                              {producto.numeroPersonalizacion &&
                                `#${producto.numeroPersonalizacion}`}
                            </p>
                          ) : (
                            <p className="font-semibold">No</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onAlternarPagoProducto(pedido.id, producto.id)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            producto.pagado
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                          }`}
                        >
                          {producto.pagado ? "Pagado" : "Pendiente pago"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onAlternarEntregaProducto(pedido.id, producto.id)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            producto.entregado
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {producto.entregado
                            ? "Entregado"
                            : "Pendiente entrega"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => onDuplicarProducto(pedido.id, producto)}
                          className="rounded-xl bg-blue-100 dark:bg-blue-950 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          Duplicar
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditarProducto(pedido.id, producto)}
                          className="rounded-xl bg-surface-subtle px-3 py-2 text-xs font-medium text-muted"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onEliminarProducto(pedido.id, producto.id)
                          }
                          className="rounded-xl bg-red-100 dark:bg-red-950 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl bg-surface md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-muted">
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
                  const calculo = calcularProducto(producto, precios);

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
                            <p className="text-xs text-muted">
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
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
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
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {producto.entregado ? "Entregado" : "Pendiente"}
                        </button>
                      </td>

                      <td className="py-4 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onDuplicarProducto(pedido.id, producto)
                            }
                            className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                          >
                            Duplicar
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditarProducto(pedido.id, producto)}
                            className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-muted"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onEliminarProducto(pedido.id, producto.id)
                            }
                            className="rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300"
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