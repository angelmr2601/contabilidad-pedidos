import type { Producto } from "@/types";

export const TIPOS_PRODUCTO = ["Fan", "Player", "Retro", "Personalizada", "Infantil"] as const;
export const TALLAS_PRODUCTO = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const;

export function crearProductoVacio(id = Date.now() * -1): Producto {
  return {
    id,
    cliente: "",
    nombre: "",
    talla: "M",
    tipo: "Fan",
    personalizacion: false,
    parche: false,
    parcheNombre: "",
    mangaLarga: false,
    nombrePersonalizacion: "",
    numeroPersonalizacion: "",
    precioVentaManual: 0,
    costeManual: 0,
    pagado: false,
    entregado: false,
    ventaUnidadSnapshot: null,
    costeUnidadSnapshot: null,
  };
}

export function duplicarProductoLocal(producto: Producto, id = Date.now() * -1): Producto {
  return {
    ...producto,
    id,
    pagado: false,
    entregado: false,
  };
}

export function guardarProductoEnLista(productos: Producto[], producto: Producto): Producto[] {
  const existe = productos.some((actual) => actual.id === producto.id);
  return existe ? productos.map((actual) => actual.id === producto.id ? producto : actual) : [...productos, producto];
}

export function reemplazarProducto(productos: Producto[], producto: Producto): Producto[] {
  return productos.map((actual) => actual.id === producto.id ? producto : actual);
}

export function alternarCampoProducto(productos: Producto[], productoId: number, campo: "pagado" | "entregado"): Producto[] {
  return productos.map((producto) => producto.id === productoId ? { ...producto, [campo]: !producto[campo] } : producto);
}
