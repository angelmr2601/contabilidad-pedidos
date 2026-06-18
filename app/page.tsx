"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import FiltrosPedidos from "../components/FiltrosPedidos";
import Icon from "../components/Icon";
import ModalAñadirPedido from "../components/ModalAñadirPedido";
import ModalAñadirProductoPedido from "../components/ModalAñadirProductoPedido";
import ModalEditarPedido from "../components/ModalEditarPedido";
import ModalEditarProducto from "../components/ModalEditarProducto";
import PedidoCard from "../components/PedidoCard";
import ResumenCards from "../components/ResumenCards";
import ResumenClienteBusqueda from "../components/ResumenClienteBusqueda";
import ResumenDetalle from "../components/ResumenDetalle";
import SimuladorPedido from "../components/SimuladorPedido";
import ConfiguracionPrecios from "../components/ConfiguracionPrecios";
import ThemeToggle from "../components/ThemeToggle";
import { cargarConfiguracionPrecios } from "../lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "../lib/precios";
import type { ConfiguracionPrecios as TipoConfiguracionPrecios } from "../types";

import {
  calcularGastoEnvioPedido,
  calcularPedidosConTotales,
  calcularResumen,
} from "../lib/calculos";
import {
  actualizarArchivadoPedidoDB,
  actualizarEstadoProductoDB,
  actualizarGastoEnvioPedidoDB,
  marcarTodosProductosPedidoDB,
  actualizarPedidoDB,
  actualizarProductoDB,
  calcularArchivadoPedido,
  cargarPedidos,
  crearPedidoConProductos,
  crearProductoEnPedido,
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
  FiltroArchivo,
  FiltroEntrega,
  FiltroPago,
  Pedido,
  PedidoEditando,
  Producto,
  ProductoEditando,
} from "../types";

type PestañaActiva = "historial" | "resumen" | "borrador" | "configuracion";

type ProductoAñadiendo = {
  pedido: Pedido;
  producto: Producto;
};

function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

function nombreMes(fechaMes: string) {
  if (!fechaMes) {
    return "Todos los pedidos";
  }

  const [year, month] = fechaMes.split("-");
  const fecha = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(fecha);
}

export default function Home() {
  const [pestañaActiva, setPestañaActiva] =
    useState<PestañaActiva>("historial");

  const [precios, setPrecios] =
    useState<TipoConfiguracionPrecios>(PRECIOS_POR_DEFECTO);

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
  const [filtroEntrega, setFiltroEntrega] = useState<FiltroEntrega>("todos");
  const [filtroArchivo, setFiltroArchivo] = useState<FiltroArchivo>("activos");

  const [filtroMesResumen, setFiltroMesResumen] = useState("");

  const [productoEditando, setProductoEditando] =
    useState<ProductoEditando | null>(null);

  const [productoAñadiendo, setProductoAñadiendo] =
    useState<ProductoAñadiendo | null>(null);

  const [pedidoEditando, setPedidoEditando] = useState<PedidoEditando | null>(
    null,
  );

  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [nombrePedido, setNombrePedido] = useState("");
  const [fechaPedido, setFechaPedido] = useState(fechaHoy());
  const [numeroPedido, setNumeroPedido] = useState("");
  const [numeroSeguimiento, setNumeroSeguimiento] = useState("");
  const [incluirGastosEnvio, setIncluirGastosEnvio] = useState(false);
  const [productosFormulario, setProductosFormulario] = useState<Producto[]>([
    crearProductoVacio(1),
  ]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargandoPedidos(true);
        setErrorCarga("");

        const [pedidosDB, preciosDB] = await Promise.all([
          cargarPedidos(),
          cargarConfiguracionPrecios(),
        ]);

        setPedidos(pedidosDB);
        setPrecios(preciosDB);
      } catch (error) {
        console.error(error);
        setErrorCarga("No se pudieron cargar los pedidos.");
      } finally {
        setCargandoPedidos(false);
      }
    }

    cargarDatos();
  }, []);

  const pedidosConTotales = calcularPedidosConTotales(pedidos, precios);

  const textoBusquedaGlobal = busqueda.trim().toLowerCase();

  const busquedaCoincideConCliente =
    textoBusquedaGlobal !== "" &&
    pedidosConTotales.some((pedido) =>
      pedido.productos.some((producto) =>
        producto.cliente.toLowerCase().includes(textoBusquedaGlobal),
      ),
    );

  const pedidosFiltrados = pedidosConTotales.filter((pedido) => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    const coincideBusqueda =
      textoBusqueda === ""
        ? true
        : busquedaCoincideConCliente
          ? pedido.productos.some((producto) =>
              producto.cliente.toLowerCase().includes(textoBusqueda),
            )
          : pedido.nombre.toLowerCase().includes(textoBusqueda) ||
            String(pedido.id).includes(textoBusqueda) ||
            pedido.fechaPedido.includes(textoBusqueda) ||
            pedido.numeroPedido.toLowerCase().includes(textoBusqueda) ||
            pedido.numeroSeguimiento.toLowerCase().includes(textoBusqueda) ||
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

    const coincideArchivo =
      filtroArchivo === "todos" ||
      (filtroArchivo === "activos" && !pedido.archivado) ||
      (filtroArchivo === "archivados" && pedido.archivado);

    const coincidePago =
      filtroPago === "todos" ||
      pedido.productos.some((producto) =>
        filtroPago === "pagado" ? producto.pagado : !producto.pagado,
      );

    const coincideEntrega =
      filtroEntrega === "todos" ||
      pedido.productos.some((producto) =>
        filtroEntrega === "entregado"
          ? producto.entregado
          : !producto.entregado,
      );

    return (
      coincideBusqueda &&
      coincideMes &&
      coincideArchivo &&
      coincidePago &&
      coincideEntrega
    );
  });

  const pedidosResumen = pedidosConTotales.filter((pedido) => {
    return (
      filtroMesResumen === "" || pedido.fechaPedido.startsWith(filtroMesResumen)
    );
  });

  const resumen = calcularResumen(pedidosResumen);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroMes("");
    setFiltroPago("todos");
    setFiltroEntrega("todos");
    setFiltroArchivo("activos");
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
    valor: string | number | boolean,
  ) {
    setProductosFormulario((productos) =>
      productos.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto,
      ),
    );
  }

  function importarProductosFormulario(productosImportados: Producto[]) {
    setProductosFormulario((productosActuales) => {
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
        setProductoFormularioAbierto(productosConIds[0].id);
      }

      return [...base, ...productosConIds];
    });
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
      (productoActual) => productoActual.id === productoId,
    );

    if (!pedido || !producto) {
      return;
    }

    const nuevoPagado = !producto.pagado;

    const productosActualizados = pedido.productos.map((productoActual) =>
      productoActual.id === productoId
        ? { ...productoActual, pagado: nuevoPagado }
        : productoActual,
    );

    const nuevoArchivado = calcularArchivadoPedido(productosActualizados);

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              archivado: nuevoArchivado,
              productos: productosActualizados,
            }
          : pedidoActual,
      ),
    );

    try {
      await actualizarEstadoProductoDB(productoId, { pagado: nuevoPagado });
      await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el pago.");
      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId ? pedido : pedidoActual,
        ),
      );
    }
  }

  async function alternarEntregaProducto(pedidoId: number, productoId: number) {
    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);
    const producto = pedido?.productos.find(
      (productoActual) => productoActual.id === productoId,
    );

    if (!pedido || !producto) {
      return;
    }

    const nuevoEntregado = !producto.entregado;

    const productosActualizados = pedido.productos.map((productoActual) =>
      productoActual.id === productoId
        ? { ...productoActual, entregado: nuevoEntregado }
        : productoActual,
    );

    const nuevoArchivado = calcularArchivadoPedido(productosActualizados);

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              archivado: nuevoArchivado,
              productos: productosActualizados,
            }
          : pedidoActual,
      ),
    );

    try {
      await actualizarEstadoProductoDB(productoId, {
        entregado: nuevoEntregado,
      });
      await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar la entrega.");
      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId ? pedido : pedidoActual,
        ),
      );
    }
  }

  async function marcarTodoPagadoPedido(pedidoId: number) {
    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);

    if (!pedido || pedido.productos.every((producto) => producto.pagado)) {
      return;
    }

    const pendientes = pedido.productos.filter(
      (producto) => !producto.pagado,
    ).length;

    const confirmar = confirm(
      `¿Marcar como pagados los ${pendientes} producto${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} del pedido #${pedidoId}?`,
    );

    if (!confirmar) {
      return;
    }

    const productosActualizados = pedido.productos.map((producto) => ({
      ...producto,
      pagado: true,
    }));

    const nuevoArchivado = calcularArchivadoPedido(productosActualizados);

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              archivado: nuevoArchivado,
              productos: productosActualizados,
            }
          : pedidoActual,
      ),
    );

    try {
      await marcarTodosProductosPedidoDB(pedidoId, "pagado");
      await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar todo como pagado.");
      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId ? pedido : pedidoActual,
        ),
      );
    }
  }

  async function marcarTodoEntregadoPedido(pedidoId: number) {
    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);

    if (!pedido || pedido.productos.every((producto) => producto.entregado)) {
      return;
    }

    const pendientes = pedido.productos.filter(
      (producto) => !producto.entregado,
    ).length;

    const confirmar = confirm(
      `¿Marcar como entregados los ${pendientes} producto${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} del pedido #${pedidoId}?`,
    );

    if (!confirmar) {
      return;
    }

    const productosActualizados = pedido.productos.map((producto) => ({
      ...producto,
      entregado: true,
    }));

    const nuevoArchivado = calcularArchivadoPedido(productosActualizados);

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === pedidoId
          ? {
              ...pedidoActual,
              archivado: nuevoArchivado,
              productos: productosActualizados,
            }
          : pedidoActual,
      ),
    );

    try {
      await marcarTodosProductosPedidoDB(pedidoId, "entregado");
      await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar todo como entregado.");
      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId ? pedido : pedidoActual,
        ),
      );
    }
  }

  async function eliminarProducto(pedidoId: number, productoId: number) {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

    if (!confirmar) {
      return;
    }

    const pedidosAntes = pedidos;

    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);

    const productosRestantes =
      pedido?.productos.filter((producto) => producto.id !== productoId) ?? [];

    const nuevoArchivado = calcularArchivadoPedido(productosRestantes);
    const nuevoGastoEnvio = pedido?.incluirGastosEnvio
      ? calcularGastoEnvioPedido(productosRestantes.length)
      : null;

    setPedidos((pedidosActuales) =>
      pedidosActuales
        .map((pedidoActual) =>
          pedidoActual.id === pedidoId
            ? {
                ...pedidoActual,
                archivado: nuevoArchivado,
                productos: pedidoActual.productos.filter(
                  (producto) => producto.id !== productoId,
                ),
              }
            : pedidoActual,
        )
        .filter((pedidoActual) => pedidoActual.productos.length > 0),
    );

    try {
      await eliminarProductoDB(productoId);

      if (productosRestantes.length > 0) {
        await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
        if (pedido?.incluirGastosEnvio) {
          await actualizarGastoEnvioPedidoDB(
            pedidoId,
            productosRestantes,
            pedido.incluirGastosEnvio,
          );
        }
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto.");
      setPedidos(pedidosAntes);
    }
  }

  async function duplicarProducto(pedidoId: number, producto: Producto) {
    const confirmar = confirm("¿Quieres duplicar este producto?");

    if (!confirmar) {
      return;
    }

    const pedido = pedidos.find((pedidoActual) => pedidoActual.id === pedidoId);

    if (!pedido) {
      return;
    }

    const productoDuplicado: Producto = {
      ...producto,
      id: 1,
      pagado: false,
      entregado: false,
    };

    try {
      setGuardando(true);

      const productoCreado = await crearProductoEnPedido(
        pedidoId,
        productoDuplicado,
        precios,
      );

      const productosActualizados = [...pedido.productos, productoCreado];
      const nuevoArchivado = calcularArchivadoPedido(productosActualizados);
      const nuevoGastoEnvio = pedido.incluirGastosEnvio
        ? calcularGastoEnvioPedido(productosActualizados.length)
        : null;

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) =>
          pedidoActual.id === pedidoId
            ? {
                ...pedidoActual,
                archivado: nuevoArchivado,
                productos: productosActualizados,
              }
            : pedidoActual,
        ),
      );

      await actualizarArchivadoPedidoDB(pedidoId, nuevoArchivado);
      if (pedido.incluirGastosEnvio) {
        await actualizarGastoEnvioPedidoDB(
          pedidoId,
          productosActualizados,
          pedido.incluirGastosEnvio,
        );
      }

      setPedidoAbierto(pedidoId);
    } catch (error) {
      console.error(error);
      alert("No se pudo duplicar el producto.");
    } finally {
      setGuardando(false);
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
    valor: string | number | boolean,
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
        : actual,
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

    const pedido = pedidos.find(
      (pedidoActual) => pedidoActual.id === productoEditando.pedidoId,
    );

    if (!pedido) {
      return;
    }

    const productosActualizados = pedido.productos.map((producto) =>
      producto.id === productoEditando.producto.id
        ? productoEditando.producto
        : producto,
    );

    const nuevoArchivado = calcularArchivadoPedido(productosActualizados);

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedidoActual) =>
        pedidoActual.id === productoEditando.pedidoId
          ? {
              ...pedidoActual,
              archivado: nuevoArchivado,
              productos: productosActualizados,
            }
          : pedidoActual,
      ),
    );

    try {
      await actualizarProductoDB(productoEditando.producto);
      await actualizarArchivadoPedidoDB(
        productoEditando.pedidoId,
        nuevoArchivado,
      );
      setProductoEditando(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto.");
      setPedidos(pedidosAntes);
    }
  }

  function abrirAñadirProductoPedido(pedido: Pedido) {
    setProductoAñadiendo({
      pedido,
      producto: crearProductoVacio(1),
    });
  }

  function actualizarProductoAñadiendo(
    campo: keyof Producto,
    valor: string | number | boolean,
  ) {
    setProductoAñadiendo((actual) =>
      actual
        ? {
            ...actual,
            producto: {
              ...actual.producto,
              [campo]: valor,
            },
          }
        : actual,
    );
  }

  async function guardarProductoAñadido() {
    if (!productoAñadiendo) {
      return;
    }

    const error = validarProductoEditando({
      pedidoId: productoAñadiendo.pedido.id,
      producto: productoAñadiendo.producto,
    });

    if (error) {
      alert(error);
      return;
    }

    try {
      setGuardando(true);

      const productoCreado = await crearProductoEnPedido(
        productoAñadiendo.pedido.id,
        productoAñadiendo.producto,
        precios,
      );

      const productosActualizados = [
        ...productoAñadiendo.pedido.productos,
        productoCreado,
      ];

      const nuevoArchivado = calcularArchivadoPedido(productosActualizados);
      const nuevoGastoEnvio = productoAñadiendo.pedido.incluirGastosEnvio
        ? calcularGastoEnvioPedido(productosActualizados.length)
        : null;

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedido) =>
          pedido.id === productoAñadiendo.pedido.id
            ? {
                ...pedido,
                archivado: nuevoArchivado,
                productos: productosActualizados,
              }
            : pedido,
        ),
      );

      await actualizarArchivadoPedidoDB(
        productoAñadiendo.pedido.id,
        nuevoArchivado,
      );
      if (productoAñadiendo.pedido.incluirGastosEnvio) {
        await actualizarGastoEnvioPedidoDB(
          productoAñadiendo.pedido.id,
          productosActualizados,
          productoAñadiendo.pedido.incluirGastosEnvio,
        );
      }

      setPedidoAbierto(productoAñadiendo.pedido.id);
      setProductoAñadiendo(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo añadir el producto.");
    } finally {
      setGuardando(false);
    }
  }

  function abrirEditorPedido(pedido: Pedido) {
    setPedidoEditando({
      id: pedido.id,
      nombre: pedido.nombre,
      fechaPedido: pedido.fechaPedido,
      numeroPedido: pedido.numeroPedido,
      numeroSeguimiento: pedido.numeroSeguimiento,
      incluirGastosEnvio: pedido.incluirGastosEnvio,
    });
  }

  function actualizarNombrePedidoEditando(nombre: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            nombre,
          }
        : actual,
    );
  }

  function actualizarFechaPedidoEditando(fechaPedidoNueva: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            fechaPedido: fechaPedidoNueva,
          }
        : actual,
    );
  }

  function actualizarNumeroPedidoEditando(numeroPedidoNuevo: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            numeroPedido: numeroPedidoNuevo,
          }
        : actual,
    );
  }

  function actualizarNumeroSeguimientoEditando(numeroSeguimientoNuevo: string) {
    setPedidoEditando((actual) =>
      actual
        ? {
            ...actual,
            numeroSeguimiento: numeroSeguimientoNuevo,
          }
        : actual,
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
    const pedidoActual = pedidos.find(
      (pedido) => pedido.id === pedidoEditando.id,
    );

    if (!pedidoActual) {
      return;
    }

    setPedidos((pedidosActuales) =>
      pedidosActuales.map((pedido) =>
        pedido.id === pedidoEditando.id
          ? {
              ...pedido,
              nombre: pedidoEditando.nombre,
              fechaPedido: pedidoEditando.fechaPedido,
              numeroPedido: pedidoEditando.numeroPedido,
              numeroSeguimiento: pedidoEditando.numeroSeguimiento,
            }
          : pedido,
      ),
    );

    try {
      await actualizarPedidoDB(
        pedidoEditando.id,
        pedidoEditando.nombre,
        pedidoEditando.fechaPedido,
        pedidoEditando.numeroPedido,
        pedidoEditando.numeroSeguimiento,
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
      "¿Seguro que quieres eliminar este pedido completo?",
    );

    if (!confirmar) {
      return;
    }

    const pedidosAntes = pedidos;

    setPedidos((pedidosActuales) =>
      pedidosActuales.filter((pedido) => pedido.id !== pedidoId),
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
      productosFormulario,
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
        numeroPedido,
        numeroSeguimiento,
        productosValidos,
        precios,
      );

      setPedidos((actuales) => [nuevoPedido, ...actuales]);
      setPedidoAbierto(nuevoPedido.id);
      setModalAbierto(false);
      setNombrePedido("");
      setFechaPedido(fechaHoy());
      setNumeroPedido("");
      setNumeroSeguimiento("");
      setIncluirGastosEnvio(false);
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
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-black">
              <Image
                src="/logo-app.png"
                alt="Logo Offside Club"
                width={80}
                height={80}
                className="h-auto w-auto object-contain"
                priority
              />
            </div>

            <div>
              <p className="text-sm font-medium text-muted">
                Contabilidad de pedidos
              </p>
              <h1 className="mt-1 text-3xl font-bold">Offside Club</h1>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <div className="rounded-2xl bg-surface p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setPestañaActiva("historial")}
              aria-label="Historial de pedidos"
              title="Historial de pedidos"
              className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                pestañaActiva === "historial"
                  ? "bg-black text-white"
                  : "bg-surface text-muted hover:bg-surface-subtle"
              }`}
            >
              <Icon name="history" className="h-5 w-5" />
              <span className="sr-only">Historial de pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => setPestañaActiva("resumen")}
              aria-label="Resumen"
              title="Resumen"
              className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                pestañaActiva === "resumen"
                  ? "bg-black text-white"
                  : "bg-surface text-muted hover:bg-surface-subtle"
              }`}
            >
              <Icon name="summary" className="h-5 w-5" />
              <span className="sr-only">Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => setPestañaActiva("borrador")}
              aria-label="Borrador"
              title="Borrador"
              className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                pestañaActiva === "borrador"
                  ? "bg-black text-white"
                  : "bg-surface text-muted hover:bg-surface-subtle"
              }`}
            >
              <Icon name="draft" className="h-5 w-5" />
              <span className="sr-only">Borrador</span>
            </button>

            <button
              type="button"
              onClick={() => setPestañaActiva("configuracion")}
              aria-label="Configuración"
              title="Configuración"
              className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                pestañaActiva === "configuracion"
                  ? "bg-black text-white"
                  : "bg-surface text-muted hover:bg-surface-subtle"
              }`}
            >
              <Icon name="settings" className="h-5 w-5" />
              <span className="sr-only">Configuración</span>
            </button>
          </div>
        </div>

        {pestañaActiva === "borrador" && (
          <SimuladorPedido
            precios={precios}
            onPedidoGuardado={(nuevoPedido) => {
              setPedidos((actuales) => [nuevoPedido, ...actuales]);
              setPedidoAbierto(nuevoPedido.id);
              setPestañaActiva("historial");
            }}
          />
        )}

        {pestañaActiva === "resumen" && (
          <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Resumen</h2>
                <p className="text-sm text-muted">
                  Mostrando: {nombreMes(filtroMesResumen)}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Filtrar por mes
                  </label>
                  <input
                    type="month"
                    value={filtroMesResumen}
                    onChange={(event) =>
                      setFiltroMesResumen(event.target.value)
                    }
                    className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 outline-none focus:border-foreground"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltroMesResumen("")}
                  aria-label="Ver total"
                  title="Ver total"
                  className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-3 text-sm font-medium"
                >
                  <Icon name="total" className="h-5 w-5" />
                  <span className="sr-only">Ver total</span>
                </button>
              </div>
            </div>

            <ResumenCards resumen={resumen} />

            <ResumenDetalle pedidos={pedidosResumen} />

            <div className="rounded-2xl bg-surface-muted p-5 text-sm text-muted">
              <p>
                Este resumen se calcula sobre{" "}
                <span className="font-semibold text-foreground">
                  {pedidosResumen.length}
                </span>{" "}
                pedido{pedidosResumen.length === 1 ? "" : "s"}.
              </p>
            </div>
          </section>
        )}

        {pestañaActiva === "historial" && (
          <section className="rounded-2xl bg-surface p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Historial de pedidos</h2>
                <p className="text-sm text-muted">
                  Gestiona pedidos, productos, pagos y entregas.
                </p>
              </div>

              <button
                type="button"
                onClick={abrirModalNuevoPedido}
                disabled={guardando}
                aria-label="Añadir pedido"
                title="Añadir pedido"
                className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="add" className="h-5 w-5" />
                <span className="sr-only">Añadir pedido</span>
              </button>
            </div>

            <FiltrosPedidos
              busqueda={busqueda}
              filtroPago={filtroPago}
              filtroEntrega={filtroEntrega}
              filtroArchivo={filtroArchivo}
              filtroMes={filtroMes}
              totalPedidos={pedidosConTotales.length}
              totalFiltrados={pedidosFiltrados.length}
              onBusquedaChange={setBusqueda}
              onFiltroPagoChange={setFiltroPago}
              onFiltroEntregaChange={setFiltroEntrega}
              onFiltroArchivoChange={setFiltroArchivo}
              onFiltroMesChange={setFiltroMes}
              onLimpiarFiltros={limpiarFiltros}
            />

            <ResumenClienteBusqueda
              busqueda={busqueda}
              pedidos={pedidosFiltrados}
              precios={precios}
            />

            <div className="space-y-3">
              {cargandoPedidos && (
                <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center">
                  <p className="font-medium">Cargando pedidos...</p>
                </div>
              )}

              {errorCarga && (
                <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-8 text-center text-red-700 dark:text-red-300">
                  <p className="font-medium">{errorCarga}</p>
                </div>
              )}

              {!cargandoPedidos &&
                !errorCarga &&
                pedidosConTotales.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center">
                    <p className="font-medium">Todavía no hay pedidos.</p>
                    <p className="mt-1 text-sm text-muted">
                      Pulsa “Añadir pedido” para crear el primero.
                    </p>
                  </div>
                )}

              {!cargandoPedidos &&
                !errorCarga &&
                pedidosConTotales.length > 0 &&
                pedidosFiltrados.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center">
                    <p className="font-medium">No hay resultados.</p>
                    <p className="mt-1 text-sm text-muted">
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
                    precios={precios}
                    abierto={pedidoAbierto === pedido.id}
                    onCambiarAbierto={cambiarPedidoAbierto}
                    onEditarPedido={abrirEditorPedido}
                    onEliminarPedido={eliminarPedido}
                    onAñadirProducto={abrirAñadirProductoPedido}
                    onDuplicarProducto={duplicarProducto}
                    onEditarProducto={abrirEditorProducto}
                    onEliminarProducto={eliminarProducto}
                    onAlternarPagoProducto={alternarPagoProducto}
                    onAlternarEntregaProducto={alternarEntregaProducto}
                    onMarcarTodoPagado={marcarTodoPagadoPedido}
                    onMarcarTodoEntregado={marcarTodoEntregadoPedido}
                  />
                ))}
            </div>
          </section>
        )}

        {pestañaActiva === "configuracion" && (
          <ConfiguracionPrecios
            precios={precios}
            onPreciosChange={setPrecios}
          />
        )}
      </div>

      {modalAbierto && (
        <ModalAñadirPedido
          precios={precios}
          nombrePedido={nombrePedido}
          fechaPedido={fechaPedido}
          numeroPedido={numeroPedido}
          numeroSeguimiento={numeroSeguimiento}
          incluirGastosEnvio={incluirGastosEnvio}
          productosFormulario={productosFormulario}
          productoFormularioAbierto={productoFormularioAbierto}
          onNombrePedidoChange={setNombrePedido}
          onFechaPedidoChange={setFechaPedido}
          onNumeroPedidoChange={setNumeroPedido}
          onNumeroSeguimientoChange={setNumeroSeguimiento}
          onIncluirGastosEnvioChange={setIncluirGastosEnvio}
          onCerrar={cerrarModalNuevoPedido}
          onGuardarPedido={guardarPedido}
          onAñadirProducto={añadirProductoFormulario}
          onCambiarProductoAbierto={cambiarProductoFormularioAbierto}
          onActualizarProducto={actualizarProductoFormulario}
          onImportarProductos={importarProductosFormulario}
        />
      )}

      {productoAñadiendo && (
        <ModalAñadirProductoPedido
          precios={precios}
          pedido={productoAñadiendo.pedido}
          producto={productoAñadiendo.producto}
          onCerrar={() => setProductoAñadiendo(null)}
          onGuardar={guardarProductoAñadido}
          onActualizarProducto={actualizarProductoAñadiendo}
        />
      )}

      {productoEditando && (
        <ModalEditarProducto
          precios={precios}
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
          onChangeNumeroPedido={actualizarNumeroPedidoEditando}
          onChangeNumeroSeguimiento={actualizarNumeroSeguimientoEditando}
          onChangeIncluirGastosEnvio={actualizarIncluirGastosEnvioEditando}
          onCerrar={() => setPedidoEditando(null)}
          onGuardar={guardarPedidoEditado}
        />
      )}
    </main>
  );
}
