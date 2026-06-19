"use client";

import { useEffect, useState } from "react";

import {
  cargarConfiguracionPrecios,
  guardarConfiguracionPrecios,
} from "../lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "../lib/precios";
import type { ConfiguracionPrecios } from "../types";
import Icon from "./Icon";

type CampoPrecio = keyof ConfiguracionPrecios;

type Props = {
  precios: ConfiguracionPrecios;
  onPreciosChange: (precios: ConfiguracionPrecios) => void;
};

const CAMPOS: {
  campo: CampoPrecio;
  titulo: string;
  descripcion: string;
}[] = [
  {
    campo: "costeFan",
    titulo: "Coste Fan",
    descripcion: "Coste base de una camiseta Fan.",
  },
  {
    campo: "ventaFan",
    titulo: "Venta Fan",
    descripcion: "Precio de venta base de una camiseta Fan.",
  },
  {
    campo: "costePlayer",
    titulo: "Coste Player",
    descripcion: "Coste base de una camiseta Player.",
  },
  {
    campo: "ventaPlayer",
    titulo: "Venta Player",
    descripcion: "Precio de venta base de una camiseta Player.",
  },
  {
    campo: "costeRetro",
    titulo: "Coste Retro",
    descripcion: "Coste base de una camiseta Retro.",
  },
  {
    campo: "ventaRetro",
    titulo: "Venta Retro",
    descripcion: "Precio de venta base de una camiseta Retro.",
  },
  {
    campo: "costeTrajeInfantil",
    titulo: "Coste traje infantil",
    descripcion: "Coste base de un traje infantil.",
  },
  {
    campo: "ventaTrajeInfantil",
    titulo: "Venta traje infantil",
    descripcion: "Precio de venta base de un traje infantil.",
  },
  {
    campo: "costeParche",
    titulo: "Coste parche",
    descripcion: "Coste de un parche.",
  },
  {
    campo: "ventaParche",
    titulo: "Venta parche",
    descripcion: "Precio de venta de un parche.",
  },
  {
    campo: "costeTalla3XL",
    titulo: "Coste extra 3XL",
    descripcion: "Extra de coste para tallas 3XL.",
  },
  {
    campo: "ventaTalla3XL",
    titulo: "Venta extra 3XL",
    descripcion: "Extra de venta para tallas 3XL.",
  },
  {
    campo: "costeTalla4XL",
    titulo: "Coste extra 4XL",
    descripcion: "Extra de coste para tallas 4XL.",
  },
  {
    campo: "ventaTalla4XL",
    titulo: "Venta extra 4XL",
    descripcion: "Extra de venta para tallas 4XL.",
  },
  {
    campo: "costePersonalizacion",
    titulo: "Coste personalización",
    descripcion: "Extra de coste cuando el producto lleva personalización.",
  },
  {
    campo: "ventaPersonalizacion",
    titulo: "Venta personalización",
    descripcion: "Extra de venta cuando el producto lleva personalización.",
  },
  {
    campo: "costeMangaLarga",
    titulo: "Coste manga larga",
    descripcion: "Extra de coste cuando la manga es larga.",
  },
  {
    campo: "ventaMangaLarga",
    titulo: "Venta manga larga",
    descripcion: "Extra de venta cuando la manga es larga.",
  },
  {
    campo: "costeFijoPedido",
    titulo: "Coste fijo por pedido",
    descripcion: "Coste fijo añadido a cada pedido.",
  },
];

export default function ConfiguracionPrecios({
  precios,
  onPreciosChange,
}: Props) {
  const [formulario, setFormulario] = useState<ConfiguracionPrecios>(precios);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    queueMicrotask(() => setFormulario(precios));
  }, [precios]);

  function actualizarCampo(campo: CampoPrecio, valor: string) {
    const numero = Number(valor);

    setFormulario((actual) => ({
      ...actual,
      [campo]: valor === "" || Number.isNaN(numero) ? actual[campo] : numero,
    }));
  }

  function validarFormulario(): string | null {
    for (const { campo, titulo } of CAMPOS) {
      const valor = formulario[campo];

      if (!Number.isFinite(valor) || valor < 0) {
        return `"${titulo}" debe ser un número mayor o igual que 0.`;
      }
    }

    return null;
  }

  async function guardar() {
    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      await guardarConfiguracionPrecios(formulario);
      onPreciosChange(formulario);

      setMensaje("Configuración guardada correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  }

  async function restaurarDefecto() {
    const confirmar = confirm(
      "¿Seguro que quieres restaurar los precios por defecto?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      const preciosDefecto = { ...PRECIOS_POR_DEFECTO };

      await guardarConfiguracionPrecios(preciosDefecto);
      setFormulario(preciosDefecto);
      onPreciosChange(preciosDefecto);

      setMensaje("Precios restaurados correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje("No se pudieron restaurar los precios.");
    } finally {
      setGuardando(false);
    }
  }

  async function recargarDesdeDB() {
    try {
      setGuardando(true);
      setMensaje("");

      const preciosDB = await cargarConfiguracionPrecios();

      setFormulario(preciosDB);
      onPreciosChange(preciosDB);

      setMensaje("Configuración recargada.");
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo recargar la configuración.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">Configuración</h2>
          <p className="text-sm text-muted">
            Ajusta los costes, precios de venta y extras usados en los cálculos.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={recargarDesdeDB}
            disabled={guardando}
            aria-label="Recargar"
            title="Recargar"
            className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Icon name="refresh" className="h-5 w-5" />
            <span className="sr-only">Recargar</span>
          </button>

          <button
            type="button"
            onClick={restaurarDefecto}
            disabled={guardando}
            aria-label="Restaurar defecto"
            title="Restaurar defecto"
            className="inline-flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-950 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 disabled:opacity-50"
          >
            <Icon name="reset" className="h-5 w-5" />
            <span className="sr-only">Restaurar defecto</span>
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            aria-label={guardando ? "Guardando" : "Guardar cambios"}
            title={guardando ? "Guardando" : "Guardar cambios"}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Icon name="save" className="h-5 w-5" />
            <span className="sr-only">
              {guardando ? "Guardando" : "Guardar cambios"}
            </span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="rounded-2xl bg-surface-muted p-4 text-sm text-muted">
          {mensaje}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CAMPOS.map((campo) => (
          <div key={campo.campo} className="rounded-2xl bg-surface-muted p-4">
            <label className="mb-2 block text-sm font-bold">
              {campo.titulo}
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={formulario[campo.campo]}
              onChange={(event) =>
                actualizarCampo(campo.campo, event.target.value)
              }
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
            />

            <p className="mt-2 text-xs text-muted">{campo.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-muted p-5 text-sm text-muted">
        <p>
          Los productos de tipo <strong>Otro</strong> no usan estos precios:
          mantienen su coste y venta manual.
        </p>
      </div>
    </section>
  );
}
