import { cargarPedidos } from "../pedidos-db";
import { calcularPedidosConTotales } from "../calculos";
import { PRECIOS_POR_DEFECTO } from "../precios";
export async function buscarPedidosPorEmail(email:string){ void email; const pedidos=await cargarPedidos(); return calcularPedidosConTotales(pedidos, PRECIOS_POR_DEFECTO).filter(p=>p.productos.some(pr=>pr.cliente.toLowerCase().includes(email.toLowerCase()))).map(p=>({ id:p.id, numeroPedido:p.numeroPedido, fechaPedido:p.fechaPedido, estado:p.archivado?"Archivado":"Activo", importe:p.totalVenta })); }
