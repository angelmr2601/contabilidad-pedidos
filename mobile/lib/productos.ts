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
