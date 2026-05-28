"use client";

import { useState } from "react";

import {
  COSTE_FIJO_PEDIDO,
  calcularProducto,
  formatoEuros,
} from "../lib/calculos";
import type { Producto } from "../types";
import ModalImportarProductos from "./ModalImportarProductos";
import ProductoForm from "./ProductoForm";

type Props = {
  nombrePedido: string;
  fechaPedido: string;
  productosFormulario: Producto[];
  productoFormularioAbierto: number;
  onNombrePedidoChange: (valor: string) => void;
  onFechaPedidoChange: (valor: string) => void;
  onCerrar: () => void;
  onGuardarPedido: () => void;
  onAñadirProducto: () => void;
  onImportarProductos: (productos: Producto[]) => void;
  onCambiarProductoAbierto: (id: number) => void;
  onActualizarProducto: (
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean
  ) => void;
};

export default function ModalAñadirPedido({
  nombrePedido,
  fechaPedido,
  productosFormulario,
  productoFormularioAbierto,
  onNombrePedidoChange,
  onFechaPedidoChange,
  onCerrar,
  onGuardarPedido,
  onAñadirProducto,
  onImportarProductos,
  onCambiarProductoAbierto,
  onActualizarProducto,
}: Props) {
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Añadir pedido</h2>
            <p className="text-sm text-neutral-500">
              Se añadirá automáticamente {formatoEuros(COSTE_FIJO_PEDIDO)} de
              coste fijo al pedido.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre del pedido
            </label>
            <input
              value={nombrePedido}
              onChange={(event) => onNombrePedidoChange(event.target.value)}
              placeholder="Ej: Pedido proveedor mayo"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fecha del pedido
            </label>
            <input
              type="date"
              value={fechaPedido}
              onChange={(event) => onFechaPedidoChange(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="space-y-3">
          {productosFormulario.map((producto, index) => {
            const calculo = calcularProducto(producto);
            const productoAbierto = productoFormularioAbierto === producto.id;

            return (
              <div
                key={producto.id}
                className="overflow-hidden rounded-2xl border border-neutral-200"
              >
                <button
                  type="button"
                  onClick={() => onCambiarProductoAbierto(producto.id)}
                  className="flex w-full flex-col gap-3 bg-white p-4 text-left transition hover:bg-neutral-50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold">Producto {index + 1}</h3>
                      <span>{productoAbierto ? "−" : "+"}</span>
                    </div>

                    <p className="mt-1 text-sm text-neutral-500">
                      {producto.nombre || "Producto sin nombre"} ·{" "}
                      {producto.cliente || "Cliente sin indicar"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm md:text-right">
                    <div>
                      <p className="text-neutral-500">Venta</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.ventaTotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Coste</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.costeTotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Beneficio</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.beneficio)}
                      </p>
                    </div>
                  </div>
                </button>

                {productoAbierto && (
                  <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                    <ProductoForm
                      producto={producto}
                      onChange={(campo, valor) =>
                        onActualizarProducto(producto.id, campo, valor)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setModalImportarAbierto(true)}
              className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium"
            >
              Importar desde tabla
            </button>

            <button
              type="button"
              onClick={onAñadirProducto}
              className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium"
            >
              Añadir producto
            </button>
          </div>

          <button
            type="button"
            onClick={onGuardarPedido}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Guardar pedido
          </button>
        </div>
      </div>

      {modalImportarAbierto && (
        <ModalImportarProductos
          onCerrar={() => setModalImportarAbierto(false)}
          onImportar={onImportarProductos}
        />
      )}
    </div>
  );
}