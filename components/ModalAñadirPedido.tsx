"use client";

import { useState } from "react";

import { calcularProducto, formatoEuros } from "../lib/calculos";
import type { ConfiguracionPrecios, Producto } from "../types";
import ModalImportarProductos from "./ModalImportarProductos";
import ProductoForm from "./ProductoForm";

import Icon from "./Icon";
type Props = {
  precios: ConfiguracionPrecios;
  nombrePedido: string;
  fechaPedido: string;
  numeroPedido: string;
  numeroSeguimiento: string;
  incluirGastosEnvio: boolean;
  productosFormulario: Producto[];
  productoFormularioAbierto: number;
  onNombrePedidoChange: (valor: string) => void;
  onFechaPedidoChange: (valor: string) => void;
  onNumeroPedidoChange: (valor: string) => void;
  onNumeroSeguimientoChange: (valor: string) => void;
  onIncluirGastosEnvioChange: (valor: boolean) => void;
  onCerrar: () => void;
  onGuardarPedido: () => void;
  onAñadirProducto: () => void;
  onImportarProductos: (productos: Producto[]) => void;
  onCambiarProductoAbierto: (id: number) => void;
  onActualizarProducto: (
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean | null,
  ) => void;
};

export default function ModalAñadirPedido({
  precios,
  nombrePedido,
  fechaPedido,
  numeroPedido,
  numeroSeguimiento,
  incluirGastosEnvio,
  productosFormulario,
  productoFormularioAbierto,
  onNombrePedidoChange,
  onFechaPedidoChange,
  onNumeroPedidoChange,
  onNumeroSeguimientoChange,
  onIncluirGastosEnvioChange,
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
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Añadir pedido</h2>
            <p className="text-sm text-muted">
              Se añadirá automáticamente {formatoEuros(precios.costeFijoPedido)}{" "}
              de coste fijo al pedido.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            title="Cerrar"
            className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-3 py-2 text-sm font-medium"
          >
            <Icon name="close" />
            <span className="sr-only">Cerrar</span>
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
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
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
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Número de pedido
            </label>
            <input
              value={numeroPedido}
              onChange={(event) => onNumeroPedidoChange(event.target.value)}
              placeholder="Ej: PED-2026-001"
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Número de seguimiento CTTExpress
            </label>
            <input
              value={numeroSeguimiento}
              onChange={(event) =>
                onNumeroSeguimientoChange(event.target.value)
              }
              placeholder="Ej: 0082800082809733407939"
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-border-strong px-4 py-3">
            <input
              type="checkbox"
              checked={incluirGastosEnvio}
              onChange={(event) =>
                onIncluirGastosEnvioChange(event.target.checked)
              }
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">
                Añadir gasto de envío al coste
              </span>
              <span className="mt-1 block text-xs text-muted">
                1 camiseta: +3,40 €, 2: +2,60 €, 3: +1,70 €, 4: +0,90 €, 5 o
                más: gratis.
              </span>
            </span>
          </label>
        </div>

        <div className="space-y-3">
          {productosFormulario.map((producto, index) => {
            const calculo = calcularProducto(producto, precios);
            const productoAbierto = productoFormularioAbierto === producto.id;

            return (
              <div
                key={producto.id}
                className="overflow-hidden rounded-2xl border border-border"
              >
                <button
                  type="button"
                  onClick={() => onCambiarProductoAbierto(producto.id)}
                  className="flex w-full flex-col gap-3 bg-surface p-4 text-left transition hover:bg-surface-muted md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold">Producto {index + 1}</h3>
                      <span>{productoAbierto ? "−" : "+"}</span>
                    </div>

                    <p className="mt-1 text-sm text-muted">
                      {producto.nombre || "Producto sin nombre"} ·{" "}
                      {producto.cliente || "Cliente sin indicar"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm md:text-right">
                    <div>
                      <p className="text-muted">Venta</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.ventaTotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted">Coste</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.costeTotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted">Beneficio</p>
                      <p className="font-bold">
                        {formatoEuros(calculo.beneficio)}
                      </p>
                    </div>
                  </div>
                </button>

                {productoAbierto && (
                  <div className="border-t border-border bg-surface-muted p-4">
                    <ProductoForm
                      producto={producto}
                      precios={precios}
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
              aria-label="Importar desde tabla"
              title="Importar desde tabla"
              className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-3 text-sm font-medium"
            >
              <Icon name="import" className="h-5 w-5" />
              <span className="sr-only">Importar desde tabla</span>
            </button>

            <button
              type="button"
              onClick={onAñadirProducto}
              aria-label="Añadir producto"
              title="Añadir producto"
              className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-3 text-sm font-medium"
            >
              <Icon name="add" className="h-5 w-5" />
              <span className="sr-only">Añadir producto</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onGuardarPedido}
            aria-label="Guardar pedido"
            title="Guardar pedido"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            <Icon name="save" className="h-5 w-5" />
            <span className="sr-only">Guardar pedido</span>
          </button>
        </div>
      </div>

      {modalImportarAbierto && (
        <ModalImportarProductos
          precios={precios}
          onCerrar={() => setModalImportarAbierto(false)}
          onImportar={onImportarProductos}
        />
      )}
    </div>
  );
}
