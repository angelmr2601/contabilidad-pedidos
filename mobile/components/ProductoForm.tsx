import { Pressable, Text, View } from "react-native";
import type { ConfiguracionPrecios, Producto, TallaProducto, TipoProducto } from "@/types";
import { calcularProducto, formatoEuros } from "@/lib/calculos";
import { TALLAS_PRODUCTO, TIPOS_PRODUCTO } from "@/lib/productos";
import { colors } from "@/theme";
import { Input } from "./ui";
import { styles } from "./styles";
export function ProductoForm({ producto, precios, onChange }: { producto: Producto; precios: ConfiguracionPrecios; onChange: (producto: Producto) => void }) {
  const set = (patch: Partial<Producto>) => onChange({ ...producto, ...patch }); const c = calcularProducto(producto, precios);
  const chip = (active: boolean) => [active ? styles.button : styles.secondaryButton, { marginRight: 4 }];
  const chipText = (active: boolean) => active ? styles.buttonText : styles.secondaryText;
  return <View style={styles.elevatedCard}>
    <Text style={styles.eyebrow}>Ficha de producto</Text><Text style={styles.subtitle}>Datos de venta</Text>
    <Text style={styles.label}>Cliente</Text><Input placeholder="Cliente" value={producto.cliente} onChangeText={(cliente) => set({ cliente })} />
    <Text style={styles.label}>Producto</Text><Input placeholder="Camiseta/producto" value={producto.nombre} onChangeText={(nombre) => set({ nombre })} />
    <Text style={styles.label}>Talla</Text><View style={styles.row}>{TALLAS_PRODUCTO.map((t) => <Pressable key={t} style={chip(producto.talla === t)} onPress={() => set({ talla: t as TallaProducto })}><Text style={chipText(producto.talla === t)}>{t}</Text></Pressable>)}</View>
    <Text style={styles.label}>Tipo</Text><View style={styles.row}>{TIPOS_PRODUCTO.map((t) => <Pressable key={t} style={chip(producto.tipo === t)} onPress={() => set({ tipo: t as TipoProducto })}><Text style={chipText(producto.tipo === t)}>{t}</Text></Pressable>)}</View>
    <Text style={styles.label}>Extras</Text><View style={styles.row}>{([ ["Personalización", "personalizacion"], ["Parche", "parche"], ["Manga larga", "mangaLarga"] ] as const).map(([label, key]) => { const active = Boolean(producto[key]); return <Pressable key={key} style={chip(active)} onPress={() => set({ [key]: !active } as Partial<Producto>)}><Text style={chipText(active)}>{active ? "✓ " : ""}{label}</Text></Pressable>; })}</View>
    {producto.personalizacion ? <><Text style={styles.label}>Personalización</Text><Input placeholder="Nombre personalización" value={producto.nombrePersonalizacion} onChangeText={(nombrePersonalizacion) => set({ nombrePersonalizacion })} /><Input placeholder="Número personalización" value={producto.numeroPersonalizacion} onChangeText={(numeroPersonalizacion) => set({ numeroPersonalizacion })} /></> : null}
    <View style={styles.statGrid}><View style={styles.stat}><Text style={styles.statLabel}>Venta</Text><Text style={styles.statValue}>{formatoEuros(c.ventaTotal)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Coste</Text><Text style={styles.statValue}>{formatoEuros(c.costeTotal)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Beneficio</Text><Text style={[styles.statValue, { color: c.beneficio >= 0 ? colors.success : colors.danger }]}>{formatoEuros(c.beneficio)}</Text></View></View>
  </View>;
}
