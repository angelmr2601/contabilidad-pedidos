import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text } from "react-native";
import { PrecioInput } from "@/components/PrecioInput";
import { AppHeader, BottomNav, Button, Card } from "@/components/ui";
import { styles } from "@/components/styles";
import { cargarConfiguracionPrecios, guardarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "@/lib/precios";
import type { ConfiguracionPrecios } from "@/types";
const SECCIONES: [string, [keyof ConfiguracionPrecios, string][]][] = [["Precios base", [["costeFan", "Fan · coste"], ["ventaFan", "Fan · venta"], ["costePlayer", "Player · coste"], ["ventaPlayer", "Player · venta"], ["costeRetro", "Retro · coste"], ["ventaRetro", "Retro · venta"], ["costePersonalizada", "Personalizada · coste"], ["ventaPersonalizada", "Personalizada · venta"], ["costeInfantil", "Infantil · coste"], ["ventaInfantil", "Infantil · venta"]]], ["Extras", [["costePersonalizacion", "Personalización · coste"], ["ventaPersonalizacion", "Personalización · venta"], ["costeParche", "Parche · coste"], ["ventaParche", "Parche · venta"], ["costeMangaLarga", "Manga larga · coste"], ["ventaMangaLarga", "Manga larga · venta"]]], ["Coste fijo", [["costeFijoPedido", "Coste fijo por pedido"]]]];
export default function ConfiguracionScreen() {
  const [precios, setPrecios] = useState<ConfiguracionPrecios>({ ...PRECIOS_POR_DEFECTO }); const [mensaje, setMensaje] = useState("");
  const cargar = useCallback(async () => { setPrecios(await cargarConfiguracionPrecios()); }, []);
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));
  async function guardar() { await guardarConfiguracionPrecios(precios); setMensaje("Ajustes guardados"); }
  return <><ScrollView style={styles.scrollScreen} contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}><AppHeader title="Ajustes" subtitle="Precios base, extras y cuenta." />{SECCIONES.map(([titulo, campos]) => <Card key={titulo} elevated><Text style={styles.subtitle}>{titulo}</Text>{campos.map(([campo, label]) => <PrecioInput key={campo} label={label} value={precios[campo]} onChange={(value) => setPrecios({ ...precios, [campo]: value })} />)}</Card>)}{mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}<Button onPress={guardar}>Guardar</Button><Button variant="danger" onPress={() => setPrecios({ ...PRECIOS_POR_DEFECTO })}>Restaurar</Button><Button variant="secondary" onPress={cargar}>Recargar</Button></ScrollView><BottomNav /></>;
}
