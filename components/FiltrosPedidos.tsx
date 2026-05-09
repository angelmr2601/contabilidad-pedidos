import type { FiltroArchivo, FiltroEntrega, FiltroPago } from "../types";

type Props = {
  busqueda: string;
  filtroPago: FiltroPago;
  filtroEntrega: FiltroEntrega;
  filtroArchivo: FiltroArchivo;
  filtroMes: string;
  totalPedidos: number;
  totalFiltrados: number;
  onBusquedaChange: (valor: string) => void;
  onFiltroPagoChange: (valor: FiltroPago) => void;
  onFiltroEntregaChange: (valor: FiltroEntrega) => void;
  onFiltroArchivoChange: (valor: FiltroArchivo) => void;
  onFiltroMesChange: (valor: string) => void;
  onLimpiarFiltros: () => void;
};

export default function FiltrosPedidos({
  busqueda,
  filtroPago,
  filtroEntrega,
  filtroArchivo,
  filtroMes,
  totalPedidos,
  totalFiltrados,
  onBusquedaChange,
  onFiltroPagoChange,
  onFiltroEntregaChange,
  onFiltroArchivoChange,
  onFiltroMesChange,
  onLimpiarFiltros,
}: Props) {
  return (
    <div className="mb-5 grid gap-3 rounded-2xl bg-neutral-50 p-4 md:grid-cols-5">
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium">Buscar</label>
        <input
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
          placeholder="Cliente, producto, pedido, dorsal..."
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Mes</label>
        <input
          type="month"
          value={filtroMes}
          onChange={(event) => onFiltroMesChange(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Archivo</label>
        <select
          value={filtroArchivo}
          onChange={(event) =>
            onFiltroArchivoChange(event.target.value as FiltroArchivo)
          }
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="activos">Activos</option>
          <option value="archivados">Archivados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Pago</label>
        <select
          value={filtroPago}
          onChange={(event) =>
            onFiltroPagoChange(event.target.value as FiltroPago)
          }
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Con pendientes</option>
          <option value="pagado">Con pagados</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Entrega</label>
        <select
          value={filtroEntrega}
          onChange={(event) =>
            onFiltroEntregaChange(event.target.value as FiltroEntrega)
          }
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Con pendientes</option>
          <option value="entregado">Con entregados</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-3 md:col-span-5">
        <p className="text-sm text-neutral-500">
          Mostrando {totalFiltrados} de {totalPedidos} pedido
          {totalPedidos === 1 ? "" : "s"}.
        </p>

        <button
          type="button"
          onClick={onLimpiarFiltros}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}