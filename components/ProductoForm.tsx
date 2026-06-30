import { calcularProducto, formatoEuros } from "../lib/calculos";
import type {
  ConfiguracionPrecios,
  Producto,
  TallaProducto,
  TipoProducto,
} from "../types";

type Props = {
  producto: Producto;
  precios: ConfiguracionPrecios;
  onChange: (campo: keyof Producto, valor: string | number | boolean) => void;
};

export default function ProductoForm({ producto, precios, onChange }: Props) {
  const calculo = calcularProducto(producto, precios);
  const esInfantil = producto.tipo === "Infantil";
  const tallasAdulto: TallaProducto[] = [
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "4XL",
  ];
  const tallasInfantiles: TallaProducto[] = [
    "16",
    "18",
    "20",
    "22",
    "24",
    "26",
    "28",
  ];
  const tallasDisponibles = esInfantil ? tallasInfantiles : tallasAdulto;

  function cambiarTipo(tipo: TipoProducto) {
    onChange("tipo", tipo);

    if (
      tipo === "Infantil" &&
      !tallasInfantiles.includes(producto.talla)
    ) {
      onChange("talla", "16");
    }

    if (tipo !== "Infantil" && !tallasAdulto.includes(producto.talla)) {
      onChange("talla", "M");
    }

  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Cliente</label>
          <input
            value={producto.cliente}
            onChange={(event) => onChange("cliente", event.target.value)}
            placeholder="Cliente"
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Producto</label>
          <input
            value={producto.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
            placeholder="Camiseta..."
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Talla</label>
          <select
            value={producto.talla}
            onChange={(event) =>
              onChange("talla", event.target.value as TallaProducto)
            }
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
          >
            {tallasDisponibles.map((talla) => (
              <option key={talla} value={talla}>
                {talla}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tipo</label>
          <select
            value={producto.tipo}
            onChange={(event) =>
              cambiarTipo(event.target.value as TipoProducto)
            }
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
          >
            <option value="Fan">Fan</option>
            <option value="Player">Player</option>
            <option value="Retro">Retro</option>
            <option value="Personalizada">Personalizada</option>
            <option value="Infantil">Infantil</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.personalizacion}
            onChange={(event) =>
              onChange("personalizacion", event.target.checked)
            }
          />
          Personalización
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.parche}
            onChange={(event) => onChange("parche", event.target.checked)}
          />
          Parche
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.mangaLarga}
            onChange={(event) => onChange("mangaLarga", event.target.checked)}
          />
          Manga larga
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.pagado}
            onChange={(event) => onChange("pagado", event.target.checked)}
          />
          Pagado
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.entregado}
            onChange={(event) => onChange("entregado", event.target.checked)}
          />
          Entregado
        </label>
      </div>

      {producto.personalizacion && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nombre personalización
            </label>
            <input
              value={producto.nombrePersonalizacion}
              onChange={(event) =>
                onChange(
                  "nombrePersonalizacion",
                  event.target.value.toUpperCase(),
                )
              }
              placeholder="Ej: MESSI"
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Número personalización
            </label>
            <input
              value={producto.numeroPersonalizacion}
              onChange={(event) =>
                onChange("numeroPersonalizacion", event.target.value)
              }
              placeholder="Ej: 10"
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-xl bg-surface p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-muted">Venta</p>
          <p className="font-bold">{formatoEuros(calculo.ventaTotal)}</p>
        </div>

        <div>
          <p className="text-muted">Coste producto</p>
          <p className="font-bold">{formatoEuros(calculo.costeTotal)}</p>
        </div>

        <div>
          <p className="text-muted">Beneficio producto</p>
          <p className="font-bold">{formatoEuros(calculo.beneficio)}</p>
        </div>
      </div>
    </>
  );
}
