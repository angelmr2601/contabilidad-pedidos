import { Text, View } from "react-native";
import { formatoEuros } from "@/lib/calculos";
import { styles } from "./styles";
export function ResumenCards({ resumen }: { resumen: { ventas: number; costes: number; beneficio: number; pendienteCobro: number; productosPendientesEntrega: number } }) {
  return <View style={styles.card}>
    <Text style={styles.subtitle}>Resumen</Text>
    <Text style={styles.text}>Ventas: {formatoEuros(resumen.ventas)}</Text>
    <Text style={styles.text}>Costes: {formatoEuros(resumen.costes)}</Text>
    <Text style={styles.text}>Beneficio: {formatoEuros(resumen.beneficio)}</Text>
    <Text style={styles.text}>Pendiente de cobro: {formatoEuros(resumen.pendienteCobro)}</Text>
    <Text style={styles.text}>Productos pendientes de entrega: {resumen.productosPendientesEntrega}</Text>
  </View>;
}
