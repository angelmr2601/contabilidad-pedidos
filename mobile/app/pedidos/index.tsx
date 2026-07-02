import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { PedidoCard } from "@/components/PedidoCard";
import { AppHeader, BottomNav, Button, EmptyState, Input, SegmentedControl } from "@/components/ui";
import { styles } from "@/components/styles";
import { calcularPedidosConTotales } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { cargarPedidos, crearPedido } from "@/lib/pedidos-db";
import type { ConfiguracionPrecios, FiltroArchivo, Pedido } from "@/types";
export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null); const [q, setQ] = useState(""); const [filtro, setFiltro] = useState<FiltroArchivo>("activos"); const [error, setError] = useState("");
  const cargar = useCallback(async () => { try { setError(""); const [p, c] = await Promise.all([cargarPedidos(), cargarConfiguracionPrecios()]); setPedidos(p); setPrecios(c); } catch (e) { setError(e instanceof Error ? e.message : "Error de conexión"); } }, []);
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));
  const data = useMemo(() => calcularPedidosConTotales(pedidos, precios ?? undefined).filter((p) => (filtro === "todos" || (filtro === "activos" ? !p.archivado : p.archivado))).filter((p) => `${p.id} ${p.nombre} ${p.productos.map((x) => `${x.cliente} ${x.nombre}`).join(" ")}`.toLowerCase().includes(q.toLowerCase())), [pedidos, precios, filtro, q]);
  async function nuevo() { if (!precios) return; const id = await crearPedido(`Pedido ${new Date().toLocaleDateString("es-ES")}`, new Date().toISOString().slice(0, 10), precios); router.push(`/pedidos/${id}`); }
  return <View style={styles.screenWithNav}><FlatList data={data} keyExtractor={(p) => String(p.id)} refreshing={false} onRefresh={cargar} renderItem={({ item }) => <PedidoCard pedido={item} onPress={() => router.push(`/pedidos/${item.id}`)} />} ListHeaderComponent={<><AppHeader title="Pedidos" subtitle="Busca y gestiona pedidos rápido." action={<Button onPress={nuevo}>Nuevo pedido</Button>} /><Input placeholder="Buscar pedido, cliente o producto" value={q} onChangeText={setQ} style={{ marginTop: 8 }} /><SegmentedControl value={filtro} onChange={setFiltro} options={[{ label: "Activos", value: "activos" }, { label: "Archivados", value: "archivados" }, { label: "Todos", value: "todos" }]} />{error ? <Text style={styles.error}>{error}</Text> : null}</>} ListEmptyComponent={<EmptyState title="Sin pedidos" body="Crea tu primer pedido para empezar." action={<Button onPress={nuevo}>Nuevo pedido</Button>} />} contentContainerStyle={{ paddingBottom: 120 }} /><BottomNav /></View>;
}
