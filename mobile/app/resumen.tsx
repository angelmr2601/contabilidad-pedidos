import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Text, View } from "react-native";
import { ResumenCards } from "@/components/ResumenCards";
import { Button } from "@/components/ui";
import { styles } from "@/components/styles";
import { calcularPedidosConTotales, calcularResumen } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { cargarPedidos } from "@/lib/pedidos-db";
import type { ConfiguracionPrecios, Pedido } from "@/types";

type Periodo = string | "todos";
const mesActual = () => new Date().toISOString().slice(0, 7);
const desplazarMes = (mes: string, delta: number) => { const [year, month] = mes.split("-").map(Number); const date = new Date(Date.UTC(year, month - 1 + delta, 1)); return date.toISOString().slice(0, 7); };
const nombreMes = (mes: string) => { const [year, month] = mes.split("-").map(Number); return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1))).replace(/^./, (c) => c.toUpperCase()); };

export default function ResumenScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null); const [periodo, setPeriodo] = useState<Periodo>(mesActual());
  const cargar = useCallback(async () => { const [p, c] = await Promise.all([cargarPedidos(), cargarConfiguracionPrecios()]); setPedidos(p); setPrecios(c); }, []);
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));
  const actual = mesActual();
  const pedidosFiltrados = useMemo(() => periodo === "todos" ? pedidos : pedidos.filter((pedido) => pedido.fechaPedido.startsWith(periodo)), [pedidos, periodo]);
  const pedidosConTotales = useMemo(() => calcularPedidosConTotales(pedidosFiltrados, precios ?? undefined), [pedidosFiltrados, precios]);
  const resumen = useMemo(() => calcularResumen(pedidosConTotales), [pedidosConTotales]);
  const mostrando = periodo === "todos" ? "Todos los pedidos" : nombreMes(periodo);
  return <View style={styles.screen}><Text style={styles.eyebrow}>Panel financiero</Text><Text style={styles.title}>Resumen</Text><View style={styles.elevatedCard}><Text style={styles.eyebrow}>Periodo</Text><Text style={styles.subtitle}>Mostrando: {mostrando}</Text><View style={styles.row}><Button variant={periodo === actual ? "primary" : "secondary"} onPress={() => setPeriodo(actual)}>Mes actual</Button><Button variant={periodo !== "todos" && periodo === desplazarMes(actual, -1) ? "primary" : "secondary"} onPress={() => setPeriodo(desplazarMes(actual, -1))}>Mes anterior</Button><Button variant={periodo === "todos" ? "primary" : "secondary"} onPress={() => setPeriodo("todos")}>Ver todos</Button></View>{periodo !== "todos" ? <><View style={[styles.between, { marginTop: 12 }]}><Button variant="secondary" onPress={() => setPeriodo(desplazarMes(periodo, -1))}>{"< Mes anterior"}</Button><Text style={styles.text}>{nombreMes(periodo)}</Text><Button variant="secondary" disabled={periodo >= actual} onPress={() => setPeriodo(desplazarMes(periodo, 1))}>Mes siguiente &gt;</Button></View>{periodo !== actual ? <Button style={{ marginTop: 12 }} onPress={() => setPeriodo(actual)}>Volver al mes actual</Button> : null}</> : <Button style={{ marginTop: 12 }} onPress={() => setPeriodo(actual)}>Volver al mes actual</Button>}</View><ResumenCards resumen={resumen} pedidos={pedidosFiltrados.length} productos={pedidosFiltrados.reduce((total, pedido) => total + pedido.productos.length, 0)} /></View>;
}
