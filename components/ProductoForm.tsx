import { calcularProducto, formatoEuros } from "../lib/calculos";
import type {
  MangaProducto,
  Producto,
  TallaProducto,
  TipoProducto,
} from "../types";

type Props = {
  producto: Producto;
  onChange: (
    campo: keyof Producto,
    valor: string | number | boolean
  ) => void;
};

export default function ProductoForm({ producto, onChange }: Props) {
  const calculo = calcularProducto(producto);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Cliente</label>
          <input
            value={producto.cliente}
            onChange={(event) => onChange("cliente", event.target.value)}
            placeholder="Cliente"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Producto</label>
          <input
            value={producto.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
            placeholder="Camiseta..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Talla</label>
          <select
            value={producto.talla}
            onChange={(event) =>
              onChange("talla", event.target.value as TallaProducto)
            }
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tipo</label>
          <select
            value={producto.tipo}
            onChange={(event) =>
              onChange("tipo", event.target.value as TipoProducto)
            }
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="Fan">Fan</option>
            <option value="Retro/Player">Retro/Player</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Manga</label>
          <select
            value={producto.manga}
            onChange={(event) =>
              onChange("manga", event.target.value as MangaProducto)
            }
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="Corta">Corta</option>
            <option value="Larga">Larga</option>
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
                  event.target.value.toUpperCase()
                )
              }
              placeholder="Ej: MESSI"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
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
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-neutral-500">Venta</p>
          <p className="font-bold">{formatoEuros(calculo.ventaTotal)}</p>
        </div>

        <div>
          <p className="text-neutral-500">Coste producto</p>
          <p className="font-bold">{formatoEuros(calculo.costeTotal)}</p>
        </div>

        <div>
          <p className="text-neutral-500">Beneficio producto</p>
          <p className="font-bold">{formatoEuros(calculo.beneficio)}</p>
        </div>
      </div>
    </>
  );
}