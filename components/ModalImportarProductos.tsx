"use client";

import { useMemo, useState } from "react";

import { calcularProducto, formatoEuros } from "../lib/calculos";
import { importarProductosDesdeTexto } from "../lib/importar-productos";
import type { Producto } from "../types";

type Props = {
  onCerrar: () => void;
  onImportar: (productos: Producto[]) => void;
};

export default function ModalImportarProductos({
  onCerrar,
  onImportar,
}: Props) {
  const [texto, setTexto] = useState("");

  const resultado = useMemo(
    () => importarProductosDesdeTexto(texto, 1),
    [texto]
  );

  function confirmarImportacion() {
    if (resultado.productos.length === 0) {
      alert("No hay productos válidos para importar.");
      return;
    }

    onImportar(resultado.productos);
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Importar productos</h2>
            <p className="text-sm text-neutral-500">
              Copia filas desde Excel, Google Sheets o una tabla y pégalas aquí.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tabla pegada
          </label>

          <textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder={`Antonio\tBetis 26/27\tS\tFan\tCorta\tNo\t€ 6,50\t€ 15,00\t€ 8,50\nAntonio\tBetis 26/27\tXL\tFan\tCorta\tNo\tParche Champions\t€ 7,00\t€ 17,00\t€ 10,00`}
            className="min-h-48 w-full rounded-xl border border-neutral-300 px-4 py-3 font-mono text-sm outline-none focus:border-black"
          />
        </div>

        {resultado.errores.length > 0 && (
          <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-bold">Avisos de importación</p>

            <ul className="mt-2 list-inside list-disc space-y-1">
              {resultado.errores.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Previsualización</h3>
            <p className="text-sm text-neutral-500">
              {resultado.productos.length} producto
              {resultado.productos.length === 1 ? "" : "s"} detectado
              {resultado.productos.length === 1 ? "" : "s"}
            </p>
          </div>

          {resultado.productos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              Pega una tabla para ver la previsualización.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50 text-neutral-500">
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Talla</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Manga</th>
                    <th className="px-4 py-3">Venta</th>
                    <th className="px-4 py-3">Coste</th>
                    <th className="px-4 py-3">Beneficio</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.productos.map((producto) => {
                    const calculo = calcularProducto(producto);

                    return (
                      <tr key={producto.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {producto.cliente}
                        </td>
                        <td className="px-4 py-3">{producto.nombre}</td>
                        <td className="px-4 py-3">{producto.talla}</td>
                        <td className="px-4 py-3">{producto.tipo}</td>
                        <td className="px-4 py-3">{producto.manga}</td>
                        <td className="px-4 py-3">
                          {formatoEuros(calculo.ventaTotal)}
                        </td>
                        <td className="px-4 py-3">
                          {formatoEuros(calculo.costeTotal)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatoEuros(calculo.beneficio)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-medium"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarImportacion}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Importar productos
          </button>
        </div>
      </div>
    </div>
  );
}