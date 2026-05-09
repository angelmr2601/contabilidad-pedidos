import type { PedidoEditando } from "../types";

type Props = {
  pedidoEditando: PedidoEditando;
  onChangeNombre: (valor: string) => void;
  onChangeFecha: (valor: string) => void;
  onCerrar: () => void;
  onGuardar: () => void;
};

export default function ModalEditarPedido({
  pedidoEditando,
  onChangeNombre,
  onChangeFecha,
  onCerrar,
  onGuardar,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Editar pedido</h2>
            <p className="text-sm text-neutral-500">
              Cambia el nombre y la fecha del pedido.
            </p>
          </div>

          <button
            onClick={onCerrar}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre del pedido
            </label>
            <input
              value={pedidoEditando.nombre}
              onChange={(event) => onChangeNombre(event.target.value)}
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
              value={pedidoEditando.fechaPedido}
              onChange={(event) => onChangeFecha(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCerrar}
            className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-medium"
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