export type TipoProducto = "Fan" | "Retro/Player" | "Otro";
export type MangaProducto = "Corta" | "Larga";
export type TallaProducto = "S" | "M" | "L" | "XL" | "XXL" | "3XL" | "4XL";

export type FiltroPago = "todos" | "pagado" | "pendiente";
export type FiltroEntrega = "todos" | "entregado" | "pendiente";
export type FiltroArchivo = "activos" | "archivados" | "todos";

export type ConfiguracionPrecios = {
  costeFan: number;
  ventaFan: number;
  costeRetroPlayer: number;
  ventaRetroPlayer: number;
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
  manga: MangaProducto;
  personalizacion: boolean;
  nombrePersonalizacion: string;
  numeroPersonalizacion: string;
  precioVentaManual: number;
  costeManual: number;
  pagado: boolean;
  entregado: boolean;
};

export type Pedido = {
  id: number;
  nombre: string;
  fechaPedido: string;
  archivado: boolean;
  productos: Producto[];
};

export type PedidoConTotales = Pedido & {
  totalVenta: number;
  costeProductos: number;
  totalCoste: number;
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
};