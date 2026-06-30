import { Pressable, Text, View } from "react-native";
import type { ConfiguracionPrecios, Producto } from "@/types";
import { calcularProducto, formatoEuros } from "@/lib/calculos";
import { colors } from "@/theme";
import { Badge, Button } from "./ui";
import { styles } from "./styles";
export function ProductoCard({ producto, precios, onTogglePagado, onToggleEntregado, onEdit, onDuplicate, onDelete }: { producto: Producto; precios: ConfiguracionPrecios; onTogglePagado: () => void; onToggleEntregado: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const c = calcularProducto(producto, precios);
  const extras = [[producto.personalizacion, "✓ Personalización"], [producto.parche, "✓ Parche"], [producto.mangaLarga, "✓ Manga larga"]].filter(([on]) => on).map(([, label]) => label as string);
  return <View style={styles.card}>
    <View style={styles.between}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>Producto</Text><Text style={styles.subtitle}>{producto.cliente || "Sin cliente"}</Text></View><Badge tone={producto.pagado && producto.entregado ? "success" : "warning"}>{producto.pagado && producto.entregado ? "Todo al día" : "Pendiente"}</Badge></View>
    <Text style={styles.text}>{producto.nombre || "Sin producto"} · {producto.talla} · {producto.tipo}</Text>
    {extras.length ? <View style={styles.row}>{extras.map((x) => <Badge key={x} tone="muted">{x}</Badge>)}</View> : null}
    <View style={styles.statGrid}><View style={styles.stat}><Text style={styles.statLabel}>Venta</Text><Text style={styles.statValue}>{formatoEuros(c.ventaTotal)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Beneficio</Text><Text style={[styles.statValue, { color: c.beneficio >= 0 ? colors.success : colors.danger }]}>{formatoEuros(c.beneficio)}</Text></View></View>
    <View style={[styles.row, { marginTop: 12 }]}><Pressable style={[styles.secondaryButton, { borderColor: producto.pagado ? colors.success : colors.warning }]} onPress={onTogglePagado}><Text style={[styles.secondaryText, { color: producto.pagado ? colors.success : colors.warning }]}>{producto.pagado ? "✓ Pagado" : "Pendiente pago"}</Text></Pressable><Pressable style={[styles.secondaryButton, { borderColor: producto.entregado ? colors.success : colors.blue }]} onPress={onToggleEntregado}><Text style={[styles.secondaryText, { color: producto.entregado ? colors.success : colors.blue }]}>{producto.entregado ? "✓ Entregado" : "Pendiente entrega"}</Text></Pressable></View>
    <View style={styles.row}><Button variant="secondary" onPress={onEdit}>Editar</Button><Button variant="secondary" onPress={onDuplicate}>Duplicar</Button><Button variant="danger" onPress={onDelete}>Eliminar</Button></View>
  </View>;
}
