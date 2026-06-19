import { calcularProducto, formatoEuros } from "../lib/calculos";
import type {
  ConfiguracionPrecios,
  MangaProducto,
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
  const esOtro = producto.tipo === "Otro";
  const esTrajeInfantil = producto.tipo === "Traje infantil";
  const esParche = producto.tipo === "Parche";
  const bloqueaExtras = esOtro || esTrajeInfantil || esParche;
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
  const tallasDisponibles = esTrajeInfantil ? tallasInfantiles : tallasAdulto;

  function cambiarTipo(tipo: TipoProducto) {
    onChange("tipo", tipo);

    if (
      tipo === "Traje infantil" &&
      !tallasInfantiles.includes(producto.talla)
    ) {
      onChange("talla", "16");
    }

    if (tipo !== "Traje infantil" && !tallasAdulto.includes(producto.talla)) {
      onChange("talla", "M");
    }

    if (tipo === "Otro" || tipo === "Traje infantil" || tipo === "Parche") {
      onChange("personalizacion", false);
      onChange("nombrePersonalizacion", "");
      onChange("numeroPersonalizacion", "");
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
            <option value="Traje infantil">Traje infantil</option>
            <option value="Parche">Parche</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Manga</label>
          <select
            value={producto.manga}
            onChange={(event) =>
              onChange("manga", event.target.value as MangaProducto)
            }
            disabled={bloqueaExtras}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted/70"
          >
            <option value="Corta">Corta</option>
            <option value="Larga">Larga</option>
          </select>
        </div>
      </div>

      {esOtro && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Precio venta manual €
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={producto.precioVentaManual}
              onChange={(event) =>
                onChange("precioVentaManual", Number(event.target.value))
              }
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Coste manual €
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={producto.costeManual}
              onChange={(event) =>
                onChange("costeManual", Number(event.target.value))
              }
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={producto.personalizacion}
            disabled={bloqueaExtras}
            onChange={(event) =>
              onChange("personalizacion", event.target.checked)
            }
          />
          Personalización
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

      {!bloqueaExtras && producto.personalizacion && (
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

      {esOtro && (
        <p className="mt-3 text-sm text-muted">
          En productos de tipo “Otro”, el coste y la venta se introducen
          manualmente. No se aplican extras automáticos por manga larga, talla
          ni personalización.
        </p>
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
