import type { ConfiguracionPrecios, Producto, ProductoEditando } from "../types";
import ProductoForm from "./ProductoForm";

import Icon from "./Icon";
type Props = {
  precios: ConfiguracionPrecios;
  productoEditando: ProductoEditando;
  onCerrar: () => void;
  onGuardar: () => void;
  onActualizarProducto: (
    campo: keyof Producto,
    valor: string | number | boolean
  ) => void;
};

export default function ModalEditarProducto({
  precios,
  productoEditando,
  onCerrar,
  onGuardar,
  onActualizarProducto,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Editar producto</h2>
            <p className="text-sm text-muted">
              Modifica los datos del producto y guarda los cambios.
            </p>
          </div>

          <button
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
          producto={productoEditando.producto}
          precios={precios}
          onChange={onActualizarProducto}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCerrar}
            aria-label="Cancelar"
            title="Cancelar"
            className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-5 py-3 text-sm font-medium"
          >
            <Icon name="close" className="h-5 w-5" />
            <span className="sr-only">Cancelar</span>
          </button>

          <button
            onClick={onGuardar}
            aria-label="Guardar cambios"
            title="Guardar cambios"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            <Icon name="save" className="h-5 w-5" />
            <span className="sr-only">Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
