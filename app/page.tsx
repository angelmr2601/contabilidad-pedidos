"use client";

import { useEffect, useState } from "react";

import FiltrosPedidos from "../components/FiltrosPedidos";
import ModalAñadirPedido from "../components/ModalAñadirPedido";
import ModalEditarPedido from "../components/ModalEditarPedido";
import ModalEditarProducto from "../components/ModalEditarProducto";
import PedidoCard from "../components/PedidoCard";
import ResumenCards from "../components/ResumenCards";

import { calcularPedidosConTotales, calcularResumen } from "../lib/calculos";
import {
  actualizarEstadoProductoDB,
  actualizarPedidoDB,
  actualizarProductoDB,
  cargarPedidos,
  crearPedidoConProductos,
  eliminarPedidoDB,
  eliminarProductoDB,
} from "../lib/pedidos-db";
import { crearProductoVacio } from "../lib/productos";
import {
  obtenerProductosValidos,
  validarNuevoPedido,
  validarPedidoEditando,
  validarProductoEditando,
} from "../lib/validaciones";

import type {
  FiltroEntrega,
  FiltroPago,
  Pedido,
  PedidoEditando,
  Producto,
  ProductoEditando,
} from "../types";

function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoFormularioAbierto, setProductoFormularioAbierto] =
    useState<number>(1);

  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroPago, setFiltroPago] = useState<FiltroPago>("todos");
  const [filtroEntrega, setFiltroEntrega] =
    useState<FiltroEntrega>("todos");

  const [productoEditando, setProductoEditando] =
    useState<ProductoEditando | null>(null);

  const [pedidoEditando, setPedidoEditando] =
    useState<PedidoEditando | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [nombrePedido, setNombrePedido] = useState("");
  const [fechaPedido, setFechaPedido] = useState(fechaHoy());
  const [productosFormulario, setProductosFormulario] = useState<Producto[]>([
    crearProductoVacio(1),
  ]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargandoPedidos(true);
        setErrorCarga("");

        const pedidosDB = await cargarPedidos();

        setPedidos(pedidosDB);
      } catch (error) {
        console.error(error);
        setErrorCarga("No se pudieron cargar los pedidos.");
      } finally {
        setCargandoPedidos(false);
      }
    }

    cargarDatos();
  }, []);

  const pedidosConTotales = calcularPedidosConTotales(pedidos);
  const resumen = calcularResumen(pedidosConTotales);

  const pedidosFiltrados = pedidosConTotales.filter((pedido) => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    const coincideBusqueda =
      textoBusqueda === "" ||
      pedido.nombre.toLowerCase().includes(textoBusqueda) ||
      String(pedido.id).includes(textoBusqueda) ||
      pedido.fechaPedido.includes(textoBusqueda) ||
      pedido.productos.some((producto) => {
        const textoProducto = [
          producto.cliente,
          producto.nombre,
          producto.talla,
          producto.tipo,
          producto.manga,
          producto.nombrePersonalizacion,
          producto.numeroPersonalizacion,
        ]
          .join(" ")
          .toLowerCase();

        return textoProducto.includes(textoBusqueda);
      });

    const coincideMes =
      filtroMes === "" || pedido.fechaPedido.startsWith(filtroMes);

    const coincidePago =
      filtroPago === "todos" ||
      pedido.productos.some((producto) =>
        filtroPago === "pagado" ? producto.pagado : !producto.pagado
      );

    const coincideEntrega =
      filtroEntrega === "todos" ||
      pedido.productos.some((producto) =>
        filtroEntrega === "entregado"
          ? producto.entregado
          : !producto.entregado
      );

    return coincideBusqueda && coincideMes && coincidePago && coincideEntrega;
  });

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroMes("");
    setFiltroPago("todos");
    setFiltroEntrega("todos");
  }

  function abrirModalNuevoPedido() {
    setModalAbierto(true);
    setProductoFormularioAbierto(1);
  }

  function cerrarModalNuevoPedido() {
    setModalAbierto(false);
  }

  function cambiarPedidoAbierto(id: number) {
    setPedidoAbierto((actual) => (actual === id ? null : id));
  }

  function cambiarProductoFormularioAbierto(id: number) {
    setProductoFormularioAbierto((actual) => (actual === id ? 0 : id));
  }

  function actualizarProductoFormulario(
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean
  ) {
    setProductosFormulario((productos) =>
      productos.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto
      )
    );
  }

  function añadirProductoFormulario() {
    setProductosFormulario((productos) => {
      const nuevoId =
        productos.length === 0
          ? 1
          : Math.max(...productos.map((producto) => producto.id)) + 1;

      setProductoFormularioAbierto(nuevoId);

      return [...productos, crearProductoVacio(nuevoId)];
    });
  }

  async function alternarPagoProducto(pedidoId: number, productoId: number) {
    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);
    const producto = pedido?.productos.find(
      (productoActual) => productoActual.id === productoId
    );

    if (!producto) {
      return;
    }

    const nuevoPagado = !producto.pagado;

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              productos: pedidoActual.productos.map((productoActual) =>
                productoActual.id === productoId
                  ? { ...productoActual, pagado: nuevoPagado }
                  : productoActual
              ),
            }
          : pedidoActual
      )
    );

    try {
      await actualizarEstadoProductoDB(productoId, { pagado: nuevoPagado });
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el pago.");

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId
            ? {
                ...pedidoActual,
                productos: pedidoActual.productos.map((productoActual) =>
                  productoActual.id === productoId
                    ? { ...productoActual, pagado: producto.pagado }
                    : productoActual
                ),
              }
            : pedidoActual
        )
      );
    }
  }

  async function alternarEntregaProducto(pedidoId: number, productoId: number) {
    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);
    const producto = pedido?.productos.find(
      (productoActual) => productoActual.id === productoId
    );

    if (!producto) {
      return;
    }

    const nuevoEntregado = !producto.entregado;

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              productos: pedidoActual.productos.map((productoActual) =>
                productoActual.id === productoId
                  ? { ...productoActual, entregado: nuevoEntregado }
                  : productoActual
              ),
            }
          : pedidoActual
      )
    );

    try {
      await actualizarEstadoProductoDB(productoId, {
        entregado: nuevoEntregado,
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar la entrega.");

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId
            ? {
                ...pedidoActual,
                productos: pedidoActual.productos.map((productoActual) =>
                  productoActual.id === productoId
                    ? { ...productoActual, entregado: producto.entregado }
                    : productoActual
                ),
              }
            : pedidoActual
        )
      );
    }
  }

  async function eliminarProducto(pedidoId: number, productoId: number) {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

    if (!confirmar) {
      return;
    }

    const pedidosAntes = pedidos;

    setPedidos((pedidosActuales) =>
      pedidosActuales
        .map((pedido) =>
          pedido.id === pedidoId
            ? {
                ...pedido,
                productos: pedido.productos.filter(
                  (producto) => producto.id !== productoId
                ),
              }
            : pedido
        )
        .filter((pedido) => pedido.productos.length > 0)
    );

    try {
      await eliminarProductoDB(productoId);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto.");
      setPedidos(pedidosAntes);
    }
  }

  function abrirEditorProducto(pedidoId: number, producto: Producto) {
    setProductoEditando({
      pedidoId,
      producto: { ...producto },
    });
  }

  function actualizarProductoEditando(
    campo: keyof Producto,
    valor: string | number | boolean
  ) {
    setProductoEditando((actual) =>
      actual
        ? {
            ...actual,
            producto: {
              ...actual.producto,
              [campo]: valor,
            },
          }
        : actual
    );
  }

  async function guardarProductoEditado() {
    if (!productoEditando) {
      return;
    }

    const error = validarProductoEditando(productoEditando);

    if (error) {
      alert(error);
      return;
    }

    const pedidosAntes = pedidos;

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedido) =>
        pedido.id === productoEditando.pedidoId
          ? {
              ...pedido,
              productos: pedido.productos.map((producto) =>
                producto.id === productoEditando.producto.id
                  ? productoEditando.producto
                  : producto
              ),
            }
          : pedido
      )
    );

    try {
      await actualizarProductoDB(productoEditando.producto);
      setProductoEditando(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto.");
      setPedidos(pedidosAntes);
    }
  }

  function abrirEditorPedido(pedido: Pedido) {
    setPedidoEditando({
      id: pedido.id,
      nombre: pedido.nombre,
      fechaPedido: pedido.fechaPedido,
    });
  }

  function actualizarNombrePedidoEditando(nombre: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            nombre,
          }
        : actual
    );
  }

  function actualizarFechaPedidoEditando(fechaPedidoNueva: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            fechaPedido: fechaPedidoNueva,
          }
        : actual
    );
  }

  async function guardarPedidoEditado() {
    if (!pedidoEditando) {
      return;
    }

    const error = validarPedidoEditando(pedidoEditando);

    if (error) {
      alert(error);
      return;
    }

    const pedidosAntes = pedidos;

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedido) =>
        pedido.id === pedidoEditando.id
          ? {
              ...pedido,
              nombre: pedidoEditando.nombre,
              fechaPedido: pedidoEditando.fechaPedido,
            }
          : pedido
      )
    );

    try {
      await actualizarPedidoDB(
        pedidoEditando.id,
        pedidoEditando.nombre,
        pedidoEditando.fechaPedido
      );
      setPedidoEditando(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el pedido.");
      setPedidos(pedidosAntes);
    }
  }

  async function eliminarPedido(pedidoId: number) {
    const confirmar = confirm(
      "¿Seguro que quieres eliminar este pedido completo?"
    );

    if (!confirmar) {
      return;
    }

    const pedidosAntes = pedidos;

    setPedidos((pedidosActuales) =>
      pedidosActuales.filter((pedido) => pedido.id !== pedidoId)
    );

    setPedidoAbierto((actual) => (actual === pedidoId ? null : actual));

    try {
      await eliminarPedidoDB(pedidoId);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el pedido.");
      setPedidos(pedidosAntes);
    }
  }

  async function guardarPedido() {
    const error = validarNuevoPedido(
      nombrePedido,
      fechaPedido,
      productosFormulario
    );

    if (error) {
      alert(error);
      return;
    }

    const productosValidos = obtenerProductosValidos(productosFormulario);

    try {
      setGuardando(true);

      const nuevoPedido = await crearPedidoConProductos(
        nombrePedido,
        fechaPedido,
        productosValidos
      );

      setPedidos((actuales) => [nuevoPedido, ...actuales]);
      setPedidoAbierto(nuevoPedido.id);
      setModalAbierto(false);
      setNombrePedido("");
      setFechaPedido(fechaHoy());
      setProductosFormulario([crearProductoVacio(1)]);
      setProductoFormularioAbierto(1);
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el pedido.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-medium text-neutral-500">
            Contabilidad de pedidos
          </p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
        </header>

        <ResumenCards resumen={resumen} />

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">Pedidos</h2>
              <p className="text-sm text-neutral-500">
                Gestiona pedidos, productos, pagos y entregas.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirModalNuevoPedido}
              disabled={guardando}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Añadir pedido
            </button>
          </div>

          <FiltrosPedidos
            busqueda={busqueda}
            filtroPago={filtroPago}
            filtroEntrega={filtroEntrega}
            filtroMes={filtroMes}
            totalPedidos={pedidosConTotales.length}
            totalFiltrados={pedidosFiltrados.length}
            onBusquedaChange={setBusqueda}
            onFiltroPagoChange={setFiltroPago}
            onFiltroEntregaChange={setFiltroEntrega}
            onFiltroMesChange={setFiltroMes}
            onLimpiarFiltros={limpiarFiltros}
          />

          <div className="space-y-3">
            {cargandoPedidos && (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                <p className="font-medium">Cargando pedidos...</p>
              </div>
            )}

            {errorCarga && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                <p className="font-medium">{errorCarga}</p>
              </div>
            )}

            {!cargandoPedidos && !errorCarga && pedidosConTotales.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                <p className="font-medium">Todavía no hay pedidos.</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Pulsa “Añadir pedido” para crear el primero.
                </p>
              </div>
            )}

            {!cargandoPedidos &&
              !errorCarga &&
              pedidosConTotales.length > 0 &&
              pedidosFiltrados.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                  <p className="font-medium">No hay resultados.</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Prueba con otra búsqueda o limpia los filtros.
                  </p>
                </div>
              )}

            {!cargandoPedidos &&
              !errorCarga &&
              pedidosFiltrados.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  abierto={pedidoAbierto === pedido.id}
                  onCambiarAbierto={cambiarPedidoAbierto}
                  onEditarPedido={abrirEditorPedido}
                  onEliminarPedido={eliminarPedido}
                  onEditarProducto={abrirEditorProducto}
                  onEliminarProducto={eliminarProducto}
                  onAlternarPagoProducto={alternarPagoProducto}
                  onAlternarEntregaProducto={alternarEntregaProducto}
                />
              ))}
          </div>
        </section>
      </div>

      {modalAbierto && (
        <ModalAñadirPedido
          nombrePedido={nombrePedido}
          fechaPedido={fechaPedido}
          productosFormulario={productosFormulario}
          productoFormularioAbierto={productoFormularioAbierto}
          onNombrePedidoChange={setNombrePedido}
          onFechaPedidoChange={setFechaPedido}
          onCerrar={cerrarModalNuevoPedido}
          onGuardarPedido={guardarPedido}
          onAñadirProducto={añadirProductoFormulario}
          onCambiarProductoAbierto={cambiarProductoFormularioAbierto}
          onActualizarProducto={actualizarProductoFormulario}
        />
      )}

      {productoEditando && (
        <ModalEditarProducto
          productoEditando={productoEditando}
          onCerrar={() => setProductoEditando(null)}
          onGuardar={guardarProductoEditado}
          onActualizarProducto={actualizarProductoEditando}
        />
      )}

      {pedidoEditando && (
        <ModalEditarPedido
          pedidoEditando={pedidoEditando}
          onChangeNombre={actualizarNombrePedidoEditando}
          onChangeFecha={actualizarFechaPedidoEditando}
          onCerrar={() => setPedidoEditando(null)}
          onGuardar={guardarPedidoEditado}
        />
      )}
    </main>
  );
}