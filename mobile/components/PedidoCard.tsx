import { Pressable, Text, View } from "react-native";
import type { PedidoConTotales } from "@/types";
import { formatoEuros, formatoFecha } from "@/lib/calculos";
import { styles } from "./styles";

export function PedidoCard({ pedido, onPress }: { pedido: PedidoConTotales; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.card}>
    <View style={styles.row}><Text style={styles.subtitle}>#{pedido.id} {pedido.nombre}</Text>{pedido.archivado ? <Text style={styles.badge}>Archivado</Text> : null}</View>
    <Text style={styles.muted}>{formatoFecha(pedido.fechaPedido)}</Text>
    <Text style={styles.text}>Venta: {formatoEuros(pedido.totalVenta)} · Coste: {formatoEuros(pedido.totalCoste)}</Text>
    <Text style={styles.text}>Beneficio: {formatoEuros(pedido.beneficio)} · Pendiente: {formatoEuros(pedido.pendienteCobro)}</Text>
    <Text style={styles.text}>Pendientes de entrega: {pedido.productosPendientesEntrega}</Text>
  </Pressable>;
}
