import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { PedidoCard } from "@/components/PedidoCard";
import { Button, EmptyState, Input } from "@/components/ui";
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
  return <View style={styles.screen}><FlatList data={data} keyExtractor={(p) => String(p.id)} refreshing={false} onRefresh={cargar} renderItem={({ item }) => <PedidoCard pedido={item} onPress={() => router.push(`/pedidos/${item.id}`)} />} ListHeaderComponent={<><Text style={styles.eyebrow}>Control operativo</Text><Text style={styles.title}>Pedidos activos</Text><View style={styles.row}><Button onPress={nuevo}>Crear pedido</Button><Button variant="secondary" onPress={() => router.push("/resumen")}>Resumen</Button><Button variant="secondary" onPress={() => router.push("/configuracion")}>Config</Button><Button variant="secondary" onPress={() => signOut()}>Salir</Button></View><Input placeholder="Buscar cliente, producto, pedido o ID" value={q} onChangeText={setQ} style={{ marginTop: 8 }} /><View style={styles.row}>{(["activos", "archivados", "todos"] as FiltroArchivo[]).map((x) => <Button key={x} variant={filtro === x ? "primary" : "secondary"} onPress={() => setFiltro(x)}>{x}</Button>)}</View>{error ? <Text style={styles.error}>{error}</Text> : null}</>} ListEmptyComponent={<EmptyState title="Todavía no hay pedidos" body="Crea tu primer pedido para empezar a controlar ventas, costes y entregas." action={<Button onPress={nuevo}>Crear pedido</Button>} />} contentContainerStyle={{ paddingBottom: 32 }} /></View>;
}
