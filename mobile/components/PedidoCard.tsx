import { Pressable, Text, View } from "react-native";
import type { PedidoConTotales } from "@/types";
import { formatoEuros, formatoFecha } from "@/lib/calculos";
import { colors } from "@/theme";
import { Badge } from "./ui";
import { styles } from "./styles";
export function PedidoCard({ pedido, onPress }: { pedido: PedidoConTotales; onPress: () => void }) {
  const alerta = pedido.pendienteCobro > 0 || pedido.productosPendientesEntrega > 0;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { overflow: "hidden", paddingLeft: 18 }, pressed && { opacity: 0.85 }]}>
    {alerta ? <View style={styles.accentBar} /> : null}
    <View style={styles.between}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>Pedido #{pedido.id}</Text><Text style={styles.subtitle}>{pedido.nombre}</Text></View><Badge tone={pedido.archivado ? "muted" : "neon"}>{pedido.archivado ? "Archivado" : "Activo"}</Badge></View>
    <Text style={styles.muted}>{formatoFecha(pedido.fechaPedido)}</Text><View style={styles.divider} />
    <View style={styles.statGrid}><View style={styles.stat}><Text style={styles.statLabel}>Venta</Text><Text style={styles.statValue}>{formatoEuros(pedido.totalVenta)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Beneficio</Text><Text style={[styles.statValue, { color: pedido.beneficio >= 0 ? colors.success : colors.danger }]}>{formatoEuros(pedido.beneficio)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Pendiente cobro</Text><Text style={[styles.statValue, { color: colors.warning }]}>{formatoEuros(pedido.pendienteCobro)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Entrega pendiente</Text><Text style={[styles.statValue, { color: colors.blue }]}>{pedido.productosPendientesEntrega}</Text></View></View>
  </Pressable>;
}
