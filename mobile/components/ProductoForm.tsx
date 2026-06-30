import { Pressable, Switch, Text, TextInput, View } from "react-native";
import type { ConfiguracionPrecios, Producto, TallaProducto, TipoProducto } from "@/types";
import { calcularProducto, formatoEuros } from "@/lib/calculos";
import { TALLAS_PRODUCTO, TIPOS_PRODUCTO } from "@/lib/productos";
import { styles } from "./styles";
export function ProductoForm({ producto, precios, onChange }: { producto: Producto; precios: ConfiguracionPrecios; onChange: (producto: Producto) => void }) {
  const set = (patch: Partial<Producto>) => onChange({ ...producto, ...patch });
  const c = calcularProducto(producto, precios);
  return <View style={styles.card}>
    <Text style={styles.subtitle}>Producto</Text>
    <TextInput style={styles.input} placeholder="Cliente" value={producto.cliente} onChangeText={(cliente) => set({ cliente })} />
    <TextInput style={styles.input} placeholder="Camiseta/producto" value={producto.nombre} onChangeText={(nombre) => set({ nombre })} />
    <Text style={styles.text}>Talla</Text><View style={styles.row}>{TALLAS_PRODUCTO.map((t) => <Pressable key={t} style={producto.talla === t ? styles.button : styles.secondaryButton} onPress={() => set({ talla: t as TallaProducto })}><Text style={producto.talla === t ? styles.buttonText : styles.secondaryText}>{t}</Text></Pressable>)}</View>
    <Text style={styles.text}>Tipo</Text><View style={styles.row}>{TIPOS_PRODUCTO.map((t) => <Pressable key={t} style={producto.tipo === t ? styles.button : styles.secondaryButton} onPress={() => set({ tipo: t as TipoProducto })}><Text style={producto.tipo === t ? styles.buttonText : styles.secondaryText}>{t}</Text></Pressable>)}</View>
    {[ ["Personalización", "personalizacion"], ["Parche", "parche"], ["Manga larga", "mangaLarga"] ].map(([label, key]) => <View key={key} style={styles.row}><Text style={styles.text}>{label}</Text><Switch value={Boolean(producto[key as keyof Producto])} onValueChange={(v) => set({ [key]: v } as Partial<Producto>)} /></View>)}
    {producto.personalizacion ? <><TextInput style={styles.input} placeholder="Nombre personalización" value={producto.nombrePersonalizacion} onChangeText={(nombrePersonalizacion) => set({ nombrePersonalizacion })} /><TextInput style={styles.input} placeholder="Número personalización" value={producto.numeroPersonalizacion} onChangeText={(numeroPersonalizacion) => set({ numeroPersonalizacion })} /></> : null}
    <Text style={styles.text}>Venta {formatoEuros(c.ventaTotal)} · Coste {formatoEuros(c.costeTotal)} · Beneficio {formatoEuros(c.beneficio)}</Text>
  </View>;
}
