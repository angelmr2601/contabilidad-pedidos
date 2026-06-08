import { calcularProducto, formatoEuros } from "../lib/calculos";
import type { ConfiguracionPrecios, Pedido, Producto } from "../types";
import ProductoForm from "./ProductoForm";

import Icon from "./Icon";
type Props = {
  precios: ConfiguracionPrecios;
  pedido: Pedido;
  producto: Producto;
  onCerrar: () => void;
  onGuardar: () => void;
  onActualizarProducto: (
    campo: keyof Producto,
    valor: string | number | boolean
  ) => void;
};

export default function ModalAñadirProductoPedido({
  precios,
  pedido,
  producto,
  onCerrar,
  onGuardar,
  onActualizarProducto,
}: Props) {
  const calculo = calcularProducto(producto, precios);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Añadir producto</h2>
            <p className="text-sm text-muted">
              Añadiendo producto a{" "}
              <span className="font-medium text-foreground">
                Pedido #{pedido.id} · {pedido.nombre}
              </span>
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

        <ProductoForm
          producto={producto}
          precios={precios}
          onChange={onActualizarProducto}
        />

        <div className="mt-6 grid gap-3 rounded-xl bg-surface-muted p-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted">Venta</p>
            <p className="font-bold">{formatoEuros(calculo.ventaTotal)}</p>
          </div>

          <div>
            <p className="text-muted">Coste</p>
            <p className="font-bold">{formatoEuros(calculo.costeTotal)}</p>
          </div>

          <div>
            <p className="text-muted">Beneficio</p>
            <p className="font-bold">{formatoEuros(calculo.beneficio)}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cancelar"
            title="Cancelar"
            className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-5 py-3 text-sm font-medium"
          >
            <Icon name="close" className="h-5 w-5" />
            <span className="sr-only">Cancelar</span>
          </button>

          <button
            type="button"
            onClick={onGuardar}
            aria-label="Guardar producto"
            title="Guardar producto"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            <Icon name="save" className="h-5 w-5" />
            <span className="sr-only">Guardar producto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
