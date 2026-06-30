import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { PrecioInput } from "@/components/PrecioInput";
import { Button, Card } from "@/components/ui";
import { styles } from "@/components/styles";
import { cargarConfiguracionPrecios, guardarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "@/lib/precios";
import type { ConfiguracionPrecios } from "@/types";
const SECCIONES: [string, [keyof ConfiguracionPrecios, string][]][] = [["Precios base", [["costeFan", "Coste Fan"], ["ventaFan", "Venta Fan"], ["costePlayer", "Coste Player"], ["ventaPlayer", "Venta Player"], ["costeRetro", "Coste Retro"], ["ventaRetro", "Venta Retro"], ["costePersonalizada", "Coste Personalizada"], ["ventaPersonalizada", "Venta Personalizada"], ["costeInfantil", "Coste Infantil"], ["ventaInfantil", "Venta Infantil"]]], ["Extras", [["costePersonalizacion", "Coste personalización"], ["ventaPersonalizacion", "Venta personalización"], ["costeParche", "Coste parche"], ["ventaParche", "Venta parche"], ["costeMangaLarga", "Coste manga larga"], ["ventaMangaLarga", "Venta manga larga"]]], ["Coste fijo", [["costeFijoPedido", "Coste fijo pedido"]]]];
export default function ConfiguracionScreen() {
  const [precios, setPrecios] = useState<ConfiguracionPrecios>({ ...PRECIOS_POR_DEFECTO }); const [mensaje, setMensaje] = useState("");
  async function cargar() { setPrecios(await cargarConfiguracionPrecios()); }
  useEffect(() => { cargar(); }, []);
  async function guardar() { await guardarConfiguracionPrecios(precios); setMensaje("Configuración guardada"); }
  return <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}><Text style={styles.eyebrow}>Configuración</Text><Text style={styles.title}>Precios del club</Text>{SECCIONES.map(([titulo, campos]) => <Card key={titulo} elevated><Text style={styles.subtitle}>{titulo}</Text>{campos.map(([campo, label]) => <PrecioInput key={campo} label={label} value={precios[campo]} onChange={(value) => setPrecios({ ...precios, [campo]: value })} />)}</Card>)}{mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}<Button onPress={guardar}>Guardar cambios</Button><Button variant="danger" onPress={() => setPrecios({ ...PRECIOS_POR_DEFECTO })}>Restaurar defecto</Button><Button variant="secondary" onPress={cargar}>Recargar</Button></ScrollView>;
}
