import { Pressable, Text, View } from "react-native";
import type { ConfiguracionPrecios, Producto } from "@/types";
import { calcularProducto, formatoEuros } from "@/lib/calculos";
import { styles } from "./styles";
export function ProductoCard({ producto, precios, onTogglePagado, onToggleEntregado, onEdit, onDuplicate, onDelete }: { producto: Producto; precios: ConfiguracionPrecios; onTogglePagado: () => void; onToggleEntregado: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const c = calcularProducto(producto, precios);
  const extras = [producto.personalizacion && "personalizada", producto.parche && "parche", producto.mangaLarga && "manga larga"].filter(Boolean).join(" · ");
  return <View style={styles.card}>
    <Text style={styles.subtitle}>{producto.cliente || "Sin cliente"}</Text><Text style={styles.text}>{producto.nombre || "Sin producto"} · {producto.talla} · {producto.tipo}</Text>
    {extras ? <Text style={styles.muted}>{extras}</Text> : null}
    <Text style={styles.text}>Venta {formatoEuros(c.ventaTotal)} · Coste {formatoEuros(c.costeTotal)} · Beneficio {formatoEuros(c.beneficio)}</Text>
    <View style={styles.row}><Pressable style={styles.secondaryButton} onPress={onTogglePagado}><Text style={styles.secondaryText}>{producto.pagado ? "Pagado" : "Pendiente pago"}</Text></Pressable><Pressable style={styles.secondaryButton} onPress={onToggleEntregado}><Text style={styles.secondaryText}>{producto.entregado ? "Entregado" : "Pendiente entrega"}</Text></Pressable></View>
    <View style={styles.row}><Pressable style={styles.button} onPress={onEdit}><Text style={styles.buttonText}>Editar</Text></Pressable><Pressable style={styles.secondaryButton} onPress={onDuplicate}><Text style={styles.secondaryText}>Duplicar</Text></Pressable><Pressable style={styles.dangerButton} onPress={onDelete}><Text style={styles.buttonText}>Eliminar</Text></Pressable></View>
  </View>;
}
