export type TipoProducto = "Fan" | "Player" | "Retro" | "Personalizada" | "Infantil";
export type TallaProducto =
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "3XL"
  | "4XL"
  | "16"
  | "18"
  | "20"
  | "22"
  | "24"
  | "26"
  | "28";

export type FiltroPago = "todos" | "pagado" | "pendiente";
export type FiltroEntrega = "todos" | "entregado" | "pendiente";
export type FiltroArchivo = "activos" | "archivados" | "todos";

export type ConfiguracionPrecios = {
  costeFan: number;
  ventaFan: number;
  costePlayer: number;
  ventaPlayer: number;
  costeRetro: number;
  ventaRetro: number;
  costePersonalizada: number;
  ventaPersonalizada: number;
  costeInfantil: number;
  ventaInfantil: number;
  costeParche: number;
  ventaParche: number;
  costeTalla3XL: number;
  ventaTalla3XL: number;
  costeTalla4XL: number;
  ventaTalla4XL: number;
  costePersonalizacion: number;
  ventaPersonalizacion: number;
  costeMangaLarga: number;
  ventaMangaLarga: number;
  costeFijoPedido: number;
};

export type Producto = {
  id: number;
  cliente: string;
  nombre: string;
  talla: TallaProducto;
  tipo: TipoProducto;
  personalizacion: boolean;
  parche: boolean;
  mangaLarga: boolean;
  nombrePersonalizacion: string;
  numeroPersonalizacion: string;
  precioVentaManual: number;
  costeManual: number;
  ventaUnidadSnapshot: number | null;
  costeUnidadSnapshot: number | null;
  pagado: boolean;
  entregado: boolean;
};

export type Pedido = {
  id: number;
  nombre: string;
  fechaPedido: string;
  numeroPedido: string;
  numeroSeguimiento: string;
  archivado: boolean;
  costeFijoSnapshot: number | null;
  incluirGastosEnvio: boolean;
  gastoEnvioSnapshot: number | null;
  productos: Producto[];
};

export type PedidoConTotales = Pedido & {
  totalVenta: number;
  costeProductos: number;
  totalCoste: number;
  gastoEnvio: number;
  beneficio: number;
  pendienteCobro: number;
  productosPendientesPago: number;
  productosPendientesEntrega: number;
};

export type ProductoEditando = {
  pedidoId: number;
  producto: Producto;
};

export type PedidoEditando = {
  id: number;
  nombre: string;
  fechaPedido: string;
  numeroPedido: string;
  numeroSeguimiento: string;
  incluirGastosEnvio: boolean;
};
