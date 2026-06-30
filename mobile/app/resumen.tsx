import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ResumenCards } from "@/components/ResumenCards";
import { styles } from "@/components/styles";
import { calcularPedidosConTotales, calcularResumen } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { cargarPedidos } from "@/lib/pedidos-db";
import type { ConfiguracionPrecios, Pedido } from "@/types";
export default function ResumenScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null); const [mes, setMes] = useState("");
  async function cargar() { const [p, c] = await Promise.all([cargarPedidos(), cargarConfiguracionPrecios()]); setPedidos(p); setPrecios(c); }
  useEffect(() => { cargar(); }, []);
  const resumen = useMemo(() => { const filtrados = mes ? pedidos.filter((p) => p.fechaPedido.startsWith(mes)) : pedidos; return calcularResumen(calcularPedidosConTotales(filtrados, precios ?? undefined)); }, [pedidos, precios, mes]);
  return <View style={styles.screen}><Text style={styles.title}>Resumen</Text><View style={styles.row}><Pressable style={!mes ? styles.button : styles.secondaryButton} onPress={() => setMes("")}><Text style={!mes ? styles.buttonText : styles.secondaryText}>Todos</Text></Pressable><Pressable style={mes ? styles.button : styles.secondaryButton} onPress={() => setMes(new Date().toISOString().slice(0, 7))}><Text style={mes ? styles.buttonText : styles.secondaryText}>Mes actual</Text></Pressable></View><ResumenCards resumen={resumen} /></View>;
}
