"use client";

import { useState } from "react";
import ModalImportarProductos from "./ModalImportarProductos";
import Icon from "./Icon";

import {
  calcularPedidosConTotales,
  calcularProducto,
  formatoEuros,
} from "../lib/calculos";
import { crearPedidoConProductos } from "../lib/pedidos-db";
import { crearProductoVacio } from "../lib/productos";
import {
  obtenerProductosValidos,
  validarNuevoPedido,
} from "../lib/validaciones";
import type { ConfiguracionPrecios, Pedido, Producto } from "../types";
import ProductoForm from "./ProductoForm";

type Props = {
  precios: ConfiguracionPrecios;
  onPedidoGuardado: (pedido: Pedido) => void;
};

function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function SimuladorPedido({ precios, onPedidoGuardado }: Props) {
  const [nombreBorrador, setNombreBorrador] = useState("Borrador");
  const [fechaBorrador, setFechaBorrador] = useState(fechaHoy());
  const [productoAbierto, setProductoAbierto] = useState<number>(1);
  const [productos, setProductos] = useState<Producto[]>([
    crearProductoVacio(1),
  ]);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const pedidoBorrador: Pedido = {
    id: 0,
    nombre: nombreBorrador || "Borrador",
    fechaPedido: fechaBorrador,
    numeroPedido: "",
    numeroSeguimiento: "",
    archivado: false,
    costeFijoSnapshot: null,
    productos,
  };

  const pedidoConTotales = calcularPedidosConTotales(
    [pedidoBorrador],
    precios,
  )[0];

  function actualizarProducto(
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean,
  ) {
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto,
      ),
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
      productosActuales.filter((producto) => producto.id !== id),
    );

    setProductoAbierto((actual) => (actual === id ? 0 : actual));
  }

  function reiniciarBorrador() {
    setNombreBorrador("Borrador");
    setFechaBorrador(fechaHoy());
    setProductos([crearProductoVacio(1)]);
    setProductoAbierto(1);
    setMensaje("");
  }

  function limpiarBorrador() {
    const confirmar = confirm("¿Seguro que quieres limpiar este borrador?");

    if (!confirmar) {
      return;
    }

    reiniciarBorrador();
  }

  async function guardarComoPedido() {
    const error = validarNuevoPedido(nombreBorrador, fechaBorrador, productos);

    if (error) {
      alert(error);
      return;
    }

    const productosValidos = obtenerProductosValidos(productos);

    try {
      setGuardando(true);
      setMensaje("");

      const nuevoPedido = await crearPedidoConProductos(
        nombreBorrador.trim(),
        fechaBorrador,
        "",
        "",
        productosValidos,
        precios,
      );

      reiniciarBorrador();
      onPedidoGuardado(nuevoPedido);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo guardar el pedido.");
      alert("No se pudo guardar el pedido.");
    } finally {
      setGuardando(false);
    }
  }

  function cambiarProductoAbierto(id: number) {
    setProductoAbierto((actual) => (actual === id ? 0 : id));
  }

  function importarProductos(productosImportados: Producto[]) {
    setProductos((productosActuales) => {
      const productoInicialVacio =
        productosActuales.length === 1 &&
        !productosActuales[0].cliente.trim() &&
        !productosActuales[0].nombre.trim();

      const base = productoInicialVacio ? [] : productosActuales;

      const maxId =
        base.length === 0
          ? 0
          : Math.max(...base.map((producto) => producto.id));

      const productosConIds = productosImportados.map((producto, index) => ({
        ...producto,
        id: maxId + index + 1,
      }));

      if (productosConIds.length > 0) {
        setProductoAbierto(productosConIds[0].id);
      }

      return [...base, ...productosConIds];
    });
  }

  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">Borrador de pedido</h2>
          <p className="text-sm text-muted">
            Simula un pedido y guárdalo en el historial cuando esté listo.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={limpiarBorrador}
            disabled={guardando}
            aria-label="Limpiar borrador"
            title="Limpiar borrador"
            className="inline-flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-950 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 disabled:opacity-50"
          >
            <Icon name="delete" className="h-5 w-5" />
            <span className="sr-only">Limpiar borrador</span>
          </button>

          <button
            type="button"
            onClick={guardarComoPedido}
            disabled={guardando}
            aria-label={guardando ? "Guardando" : "Guardar como pedido"}
            title={guardando ? "Guardando" : "Guardar como pedido"}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Icon name="save" className="h-5 w-5" />
            <span className="sr-only">
              {guardando ? "Guardando" : "Guardar como pedido"}
            </span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
          {mensaje}
        </div>
      )}

      <div className="grid gap-4 rounded-2xl bg-surface-muted p-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nombre del borrador
          </label>
          <input
            value={nombreBorrador}
            onChange={(event) => setNombreBorrador(event.target.value)}
            placeholder="Ej: Simulación pedido mayo"
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
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
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-muted">Venta estimada</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.totalVenta)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-muted">Coste estimado</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.totalCoste)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-muted">Beneficio estimado</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(pedidoConTotales.beneficio)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-muted">Productos</p>
          <p className="mt-2 text-2xl font-bold">{productos.length}</p>
        </div>

        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-muted">Coste fijo pedido</p>
          <p className="mt-2 text-2xl font-bold">
            {formatoEuros(precios.costeFijoPedido)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {productos.map((producto, index) => {
          const calculo = calcularProducto(producto, precios);
          const abierto = productoAbierto === producto.id;

          return (
            <div
              key={producto.id}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <button
                type="button"
                onClick={() => cambiarProductoAbierto(producto.id)}
                className="flex w-full flex-col gap-3 bg-surface p-4 text-left transition hover:bg-surface-muted md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">Producto {index + 1}</h3>
                    <span>{abierto ? "−" : "+"}</span>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    {producto.nombre || "Producto sin nombre"} ·{" "}
                    {producto.cliente || "Cliente sin indicar"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm md:text-right">
                  <div>
                    <p className="text-muted">Venta</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.ventaTotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted">Coste</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.costeTotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted">Beneficio</p>
                    <p className="font-bold">
                      {formatoEuros(calculo.beneficio)}
                    </p>
                  </div>
                </div>
              </button>

              {abierto && (
                <div className="border-t border-border bg-surface-muted p-4">
                  <ProductoForm
                    producto={producto}
                    precios={precios}
                    onChange={(campo, valor) =>
                      actualizarProducto(producto.id, campo, valor)
                    }
                  />

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => duplicarProducto(producto)}
                      aria-label="Duplicar producto"
                      title="Duplicar producto"
                      className="inline-flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300"
                    >
                      <Icon name="copy" />
                      <span className="sr-only">Duplicar producto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      aria-label="Eliminar producto"
                      title="Eliminar producto"
                      className="inline-flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-950 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300"
                    >
                      <Icon name="delete" />
                      <span className="sr-only">Eliminar producto</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setModalImportarAbierto(true)}
          disabled={guardando}
          aria-label="Importar desde tabla"
          title="Importar desde tabla"
          className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          <Icon name="import" className="h-5 w-5" />
          <span className="sr-only">Importar desde tabla</span>
        </button>

        <button
          type="button"
          onClick={añadirProducto}
          disabled={guardando}
          aria-label="Añadir producto al borrador"
          title="Añadir producto al borrador"
          className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          <Icon name="add" className="h-5 w-5" />
          <span className="sr-only">Añadir producto al borrador</span>
        </button>

        <button
          type="button"
          onClick={guardarComoPedido}
          disabled={guardando}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar como pedido"}
        </button>
      </div>

      <div className="rounded-2xl bg-surface-muted p-5 text-sm text-muted">
        <p>
          El borrador no se guarda automáticamente. Usa &quot;Guardar como
          pedido&quot; para añadirlo al historial o recarga la página para
          empezar de nuevo.
        </p>
      </div>

      {modalImportarAbierto && (
        <ModalImportarProductos
          precios={precios}
          onCerrar={() => setModalImportarAbierto(false)}
          onImportar={importarProductos}
        />
      )}
    </section>
  );
}
