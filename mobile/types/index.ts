export type TipoProducto = "Fan" | "Player" | "Retro" | "Personalizada" | "Infantil";
export type TallaProducto = "S" | "M" | "L" | "XL" | "XXL" | "3XL" | "4XL";
export type FiltroArchivo = "activos" | "archivados" | "todos";

export type Producto = {
  id: number;
  cliente: string;
  nombre: string;
  talla: TallaProducto;
  tipo: TipoProducto;
  personalizacion: boolean;
  parche: boolean;
  parcheNombre: string;
  mangaLarga: boolean;
  nombrePersonalizacion: string;
  numeroPersonalizacion: string;
  precioVentaManual: number;
  costeManual: number;
  pagado: boolean;
  entregado: boolean;
  ventaUnidadSnapshot: number | null;
  costeUnidadSnapshot: number | null;
};

export type Pedido = {
  id: number;
  nombre: string;
  fechaPedido: string;
  numeroSeguimiento: string | null;
  archivado: boolean;
  costeFijoSnapshot: number | null;
  productos: Producto[];
};

export type ConfiguracionPrecios = {
  costeFan: number; ventaFan: number;
  costePlayer: number; ventaPlayer: number;
  costeRetro: number; ventaRetro: number;
  costePersonalizada: number; ventaPersonalizada: number;
  costeInfantil: number; ventaInfantil: number;
  costePersonalizacion: number; ventaPersonalizacion: number;
  costeParche: number; ventaParche: number;
  costeMangaLarga: number; ventaMangaLarga: number;
  costeFijoPedido: number;
};

export type PedidoConTotales = Pedido & {
  totalVenta: number;
  costeProductos: number;
  totalCoste: number;
  beneficio: number;
  pendienteCobro: number;
  productosPendientesEntrega: number;
};
