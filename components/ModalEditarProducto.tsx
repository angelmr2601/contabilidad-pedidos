import type { ConfiguracionPrecios, Producto, ProductoEditando } from "../types";
import ProductoForm from "./ProductoForm";

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
            className="rounded-xl bg-surface-subtle px-3 py-2 text-sm font-medium"
          >
            Cerrar
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
            className="rounded-xl bg-surface-subtle px-5 py-3 text-sm font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={onGuardar}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}