import type { Producto } from "../types";

export function crearProductoVacio(id: number): Producto {
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
    ventaUnidadSnapshot: null,
    costeUnidadSnapshot: null,
    pagado: false,
    entregado: false,
  };
}
