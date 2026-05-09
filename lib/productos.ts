import type { Producto } from "../types";

export function crearProductoVacio(id: number): Producto {
  return {
    id,
    cliente: "",
    nombre: "",
    talla: "M",
    tipo: "Fan",
    manga: "Corta",
    personalizacion: false,
    nombrePersonalizacion: "",
    numeroPersonalizacion: "",
    pagado: false,
    entregado: false,
  };
}