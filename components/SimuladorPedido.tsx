"use client";

import { useState } from "react";

import {
  calcularPedidosConTotales,
  calcularProducto,
  formatoEuros,
} from "../lib/calculos";
import { crearProductoVacio } from "../lib/productos";
import type { Pedido, Producto } from "../types";
import ProductoForm from "./ProductoForm";

function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function SimuladorPedido() {
  const [nombreBorrador, setNombreBorrador] = useState("Borrador");
  const [fechaBorrador, setFechaBorrador] = useState(fechaHoy());
  const [productoAbierto, setProductoAbierto] = useState<number>(1);
  const [productos, setProductos] = useState<Producto[]>([
    crearProductoVacio(1),
  ]);

  const pedidoBorrador: Pedido = {
    id: 0,
    nombre: nombreBorrador || "Borrador",
    fechaPedido: fechaBorrador,
    archivado: false,
    productos,
  };

  const pedidoConTotales = calcularPedidosConTotales([pedidoBorrador])[0];

  function actualizarProducto(
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean
  ) {
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto
      )
    );
  }

  function añadirProducto() {
    setProductos((productosActuales) => {
      const nuevoId =
        productosActuales.length === 0
          ? 1
          : Math.max(...productosActuales.map((producto) => producto.id)) + 1;

      setProductoAbierto(nuevoId);

      return [...productosActuales, crearProductoVacio(nuevoId)];
    });
  }

  function duplicarProducto(producto: Producto) {
    setProductos((productosActuales) => {
      const nuevoId =
        productosActuales.length === 0
          ? 1
          : Math.max(...productosActuales.map((item) => item.id)) + 1;

      const productoDuplicado: Producto = {
        ...producto,
        id: nuevoId,
        pagado: false,
        entregado: false,
      };

      setProductoAbierto(nuevoId);

      return [...productosActuales, productoDuplicado];
    });
  }

  function eliminarProducto(id: number) {
    if (productos.length === 1) {
      setProductos([crearProductoVacio(1)]);
      setProductoAbierto(1);
      return;
    }

    setProductos((productosActuales) =>
      productosActuales.filter((producto) => producto.id !== id)
    );

    setProductoAbierto((actual) => (actual === id ? 0 : actual));
  }

  function limpiarBorrador() {
    const confirmar = confirm("¿Seguro que quieres limpiar este borrador?");

    if (!confirmar) {
      return;
    }

    setNombreBorrador("Borrador");
    setFechaBorrador(fechaHoy());
    setProductos([crearProductoVacio(1)]);
    setProductoAbierto(1);
  }

  function cambiarProductoAbierto(id: number) {
    setProductoAbierto((actual) => (actual === id ? 0 : id));
  }

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">Borrador de pedido</h2>
          <p className="text-sm text-neutral-500">
            Simula un pedido sin guardarlo en la base de datos.
          </p>
        </div>

        <button
          type="button"
          onClick={limpiarBorrador}
          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
        >
          Limpiar borrador
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl bg-neutral-50 p-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nombre del borrador
          </label>
          <input
            value={nombreBorrador}
            onChange={(event) => setNombreBorrador(event.target.value)}
            placeholder="Ej: Simulación pedido mayo"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fecha del borrador
          </label>
          <input
            type="date"
            value={fechaBorrador}
            onChange={(event) => setFechaBorrador(event.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Venta estimada</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.totalVenta)}
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Coste estimado</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.totalCoste)}
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Beneficio estimado</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.beneficio)}
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Productos</p>
          <p className="mt-2 text-2xl font-bold">{productos.length}</p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Coste fijo pedido</p>
          <p className="mt-2 text-2xl font-bold">{formatoEuros(4)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {productos.map((producto, index) => {
          const calculo = calcularProducto(producto);
          const abierto = productoAbierto === producto.id;

          return (
            <div
              key={producto.id}
              className="overflow-hidden rounded-2xl border border-neutral-200"
            >
              <button
                type="button"
                onClick={() => cambiarProductoAbierto(producto.id)}
                className="flex w-full flex-col gap-3 bg-white p-4 text-left transition hover:bg-neutral-50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">Producto {index + 1}</h3>
                    <span>{abierto ? "−" : "+"}</span>
                  </div>

                  <p className="mt-1 text-sm text-neutral-500">
                    {producto.nombre || "Producto sin nombre"} ·{" "}
                    {producto.cliente || "Cliente sin indicar"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm md:text-right">
                  <div>
                    <p className="text-neutral-500">Venta</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.ventaTotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Coste</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.costeTotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Beneficio</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.beneficio)}
                    </p>
                  </div>
                </div>
              </button>

              {abierto && (
                <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                  <ProductoForm
                    producto={producto}
                    onChange={(campo, valor) =>
                      actualizarProducto(producto.id, campo, valor)
                    }
                  />

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => duplicarProducto(producto)}
                      className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                    >
                      Duplicar producto
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      Eliminar producto
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={añadirProducto}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Añadir producto al borrador
        </button>
      </div>

      <div className="rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-600">
        <p>
          Este borrador no se guarda. Si recargas la página, se perderán los
          datos de la simulación.
        </p>
      </div>
    </section>
  );
}