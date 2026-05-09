import type { PedidoEditando, Producto, ProductoEditando } from "../types";

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

  const productoPersonalizadoSinDatos = productosValidos.find(
    (producto) =>
      producto.personalizacion &&
      !producto.nombrePersonalizacion.trim() &&
      !producto.numeroPersonalizacion.trim()
  );

  if (productoPersonalizadoSinDatos) {
    return "Hay un producto con personalización marcada, pero sin nombre ni número.";
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

  if (
    productoEditando.producto.personalizacion &&
    !productoEditando.producto.nombrePersonalizacion.trim() &&
    !productoEditando.producto.numeroPersonalizacion.trim()
  ) {
    return "La personalización está marcada, pero no hay nombre ni número indicado.";
  }

  return null;
}

export function validarPedidoEditando(pedidoEditando: PedidoEditando) {
  if (!pedidoEditando.nombre.trim()) {
    return "El pedido necesita un nombre.";
  }

  return null;
}