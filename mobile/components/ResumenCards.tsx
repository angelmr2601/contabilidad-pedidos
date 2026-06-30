import { Text, View } from "react-native";
import { formatoEuros } from "@/lib/calculos";
import { colors } from "@/theme";
import { styles } from "./styles";
export function ResumenCards({ resumen, pedidos, productos }: { resumen: { ventas: number; costes: number; beneficio: number; pendienteCobro: number; productosPendientesEntrega: number }; pedidos?: number; productos?: number }) {
  const stats = [
    ["Ventas", formatoEuros(resumen.ventas), colors.text], ["Costes", formatoEuros(resumen.costes), colors.textSoft], ["Beneficio", formatoEuros(resumen.beneficio), resumen.beneficio >= 0 ? colors.success : colors.danger], ["Pendiente de cobro", formatoEuros(resumen.pendienteCobro), colors.warning], ["Entrega pendiente", String(resumen.productosPendientesEntrega), colors.blue], ["Pedidos", String(pedidos ?? 0), colors.text], ["Productos vendidos", String(productos ?? 0), colors.neon],
  ];
  return <View style={styles.elevatedCard}><Text style={styles.eyebrow}>Resumen financiero</Text><Text style={styles.subtitle}>Control del club</Text><View style={styles.statGrid}>{stats.map(([label, value, color]) => <View key={label} style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, { color }]}>{value}</Text></View>)}</View></View>;
}
