import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { PedidoCard } from "@/components/PedidoCard";
import { styles } from "@/components/styles";
import { calcularPedidosConTotales } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { cargarPedidos, crearPedido } from "@/lib/pedidos-db";
import { signOut } from "@/lib/auth";
import type { ConfiguracionPrecios, FiltroArchivo, Pedido } from "@/types";
export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null); const [q, setQ] = useState(""); const [filtro, setFiltro] = useState<FiltroArchivo>("activos"); const [error, setError] = useState("");
  const cargar = useCallback(async () => { try { setError(""); const [p, c] = await Promise.all([cargarPedidos(), cargarConfiguracionPrecios()]); setPedidos(p); setPrecios(c); } catch (e) { setError(e instanceof Error ? e.message : "Error de conexión"); } }, []);
  useEffect(() => { cargar(); }, [cargar]);
  const data = useMemo(() => calcularPedidosConTotales(pedidos, precios ?? undefined).filter((p) => (filtro === "todos" || (filtro === "activos" ? !p.archivado : p.archivado))).filter((p) => `${p.id} ${p.nombre} ${p.productos.map((x) => `${x.cliente} ${x.nombre}`).join(" ")}`.toLowerCase().includes(q.toLowerCase())), [pedidos, precios, filtro, q]);
  async function nuevo() { if (!precios) return; const id = await crearPedido(`Pedido ${new Date().toLocaleDateString("es-ES")}`, new Date().toISOString().slice(0, 10), precios); router.push(`/pedidos/${id}`); }
  return <View style={styles.screen}><Text style={styles.title}>Pedidos</Text><View style={styles.row}><Pressable style={styles.button} onPress={nuevo}><Text style={styles.buttonText}>Crear pedido</Text></Pressable><Pressable style={styles.secondaryButton} onPress={() => router.push("/resumen")}><Text style={styles.secondaryText}>Resumen</Text></Pressable><Pressable style={styles.secondaryButton} onPress={() => router.push("/configuracion")}><Text style={styles.secondaryText}>Configuración</Text></Pressable><Pressable style={styles.secondaryButton} onPress={() => signOut()}><Text style={styles.secondaryText}>Salir</Text></Pressable></View><TextInput style={styles.input} placeholder="Buscar por cliente, producto, pedido o ID" value={q} onChangeText={setQ} /><View style={styles.row}>{(["activos", "archivados", "todos"] as FiltroArchivo[]).map((x) => <Pressable key={x} style={filtro === x ? styles.button : styles.secondaryButton} onPress={() => setFiltro(x)}><Text style={filtro === x ? styles.buttonText : styles.secondaryText}>{x}</Text></Pressable>)}</View>{error ? <Text style={styles.error}>{error}</Text> : null}<FlatList data={data} keyExtractor={(p) => String(p.id)} refreshing={false} onRefresh={cargar} renderItem={({ item }) => <PedidoCard pedido={item} onPress={() => router.push(`/pedidos/${item.id}`)} />} /></View>;
}
