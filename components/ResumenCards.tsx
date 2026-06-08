import { formatoEuros } from "../lib/calculos";

type Resumen = {
  ventas: number;
  costes: number;
  beneficio: number;
  pendienteCobro: number;
  productosPendientesEntrega: number;
};

type Props = {
  resumen: Resumen;
};

export default function ResumenCards({ resumen }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-5">
      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Ventas totales</p>
        <p className="mt-2 text-2xl font-bold">
          {formatoEuros(resumen.ventas)}
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Costes totales</p>
        <p className="mt-2 text-2xl font-bold">
          {formatoEuros(resumen.costes)}
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Beneficio</p>
        <p className="mt-2 text-2xl font-bold">
          {formatoEuros(resumen.beneficio)}
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Pendiente de cobro</p>
        <p className="mt-2 text-2xl font-bold">
          {formatoEuros(resumen.pendienteCobro)}
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted">Pendiente de entrega</p>
        <p className="mt-2 text-2xl font-bold">
          {resumen.productosPendientesEntrega}
        </p>
      </div>
    </section>
  );
}