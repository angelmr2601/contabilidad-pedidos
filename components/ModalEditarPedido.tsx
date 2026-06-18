import type { PedidoEditando } from "../types";

import Icon from "./Icon";
type Props = {
  pedidoEditando: PedidoEditando;
  onChangeNombre: (valor: string) => void;
  onChangeFecha: (valor: string) => void;
  onChangeNumeroPedido: (valor: string) => void;
  onChangeNumeroSeguimiento: (valor: string) => void;
  onChangeIncluirGastosEnvio: (valor: boolean) => void;
  onCerrar: () => void;
  onGuardar: () => void;
};

export default function ModalEditarPedido({
  pedidoEditando,
  onChangeNombre,
  onChangeFecha,
  onChangeNumeroPedido,
  onChangeNumeroSeguimiento,
  onChangeIncluirGastosEnvio,
  onCerrar,
  onGuardar,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Editar pedido</h2>
            <p className="text-sm text-muted">
              Cambia los datos internos y el seguimiento del pedido.
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

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre del pedido
            </label>
            <input
              value={pedidoEditando.nombre}
              onChange={(event) => onChangeNombre(event.target.value)}
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
              value={pedidoEditando.fechaPedido}
              onChange={(event) => onChangeFecha(event.target.value)}
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Número de pedido
            </label>
            <input
              value={pedidoEditando.numeroPedido}
              onChange={(event) => onChangeNumeroPedido(event.target.value)}
              placeholder="Ej: PED-2026-001"
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Número de seguimiento CTTExpress
            </label>
            <input
              value={pedidoEditando.numeroSeguimiento}
              onChange={(event) =>
                onChangeNumeroSeguimiento(event.target.value)
              }
              placeholder="Ej: 0082800082809733407939"
              className="w-full rounded-xl border border-border-strong px-4 py-3 outline-none focus:border-foreground"
            />
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-border-strong px-4 py-3">
            <input
              type="checkbox"
              checked={pedidoEditando.incluirGastosEnvio}
              onChange={(event) =>
                onChangeIncluirGastosEnvio(event.target.checked)
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
