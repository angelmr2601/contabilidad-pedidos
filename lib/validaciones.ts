import type { PedidoEditando, Producto, ProductoEditando } from "../types";

function productoPersonalizadoSinDatos(producto: Producto) {
  return (
    producto.tipo !== "Otro" &&
    producto.personalizacion &&
    !producto.nombrePersonalizacion.trim() &&
    !producto.numeroPersonalizacion.trim()
  );
}

function productoOtroSinPrecios(producto: Producto) {
  return (
    producto.tipo === "Otro" &&
    (producto.precioVentaManual <= 0 || producto.costeManual < 0)
  );
}

export function validarNuevoPedido(
  nombrePedido: string,
  productosFormulario: Producto[]
) {
  if (!nombrePedido.trim()) {
    return "Añade un nombre para el pedido.";
  }

  const productosValidos = productosFormulario.filter(
    (producto) => producto.nombre.trim() && producto.cliente.trim()
  );

  if (productosValidos.length === 0) {
    return "Añade al menos un producto con cliente y nombre de producto.";
  }

  const personalizadoSinDatos = productosValidos.find(
    productoPersonalizadoSinDatos
  );

  if (personalizadoSinDatos) {
    return "Hay un producto con personalización marcada, pero sin nombre ni número.";
  }

  const otroSinPrecios = productosValidos.find(productoOtroSinPrecios);

  if (otroSinPrecios) {
    return "Hay un producto de tipo Otro sin precio de venta válido.";
  }

  return null;
}

export function obtenerProductosValidos(productosFormulario: Producto[]) {
  return productosFormulario.filter(
    (producto) => producto.nombre.trim() && producto.cliente.trim()
  );
}

export function validarProductoEditando(productoEditando: ProductoEditando) {
  if (!productoEditando.producto.cliente.trim()) {
    return "Añade el cliente del producto.";
  }

  if (!productoEditando.producto.nombre.trim()) {
    return "Añade el nombre del producto.";
  }

  if (productoPersonalizadoSinDatos(productoEditando.producto)) {
    return "La personalización está marcada, pero no hay nombre ni número indicado.";
  }

  if (productoOtroSinPrecios(productoEditando.producto)) {
    return "El producto de tipo Otro necesita un precio de venta válido.";
  }

  return null;
}

export function validarPedidoEditando(pedidoEditando: PedidoEditando) {
  if (!pedidoEditando.nombre.trim()) {
    return "El pedido necesita un nombre.";
  }

  return null;
}