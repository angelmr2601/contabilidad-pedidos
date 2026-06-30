import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { PrecioInput } from "@/components/PrecioInput";
import { styles } from "@/components/styles";
import { cargarConfiguracionPrecios, guardarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "@/lib/precios";
import type { ConfiguracionPrecios } from "@/types";
const CAMPOS: [keyof ConfiguracionPrecios, string][] = [["costeFan", "Coste Fan"], ["ventaFan", "Venta Fan"], ["costePlayer", "Coste Player"], ["ventaPlayer", "Venta Player"], ["costeRetro", "Coste Retro"], ["ventaRetro", "Venta Retro"], ["costePersonalizada", "Coste Personalizada"], ["ventaPersonalizada", "Venta Personalizada"], ["costeInfantil", "Coste Infantil"], ["ventaInfantil", "Venta Infantil"], ["costePersonalizacion", "Coste personalización"], ["ventaPersonalizacion", "Venta personalización"], ["costeParche", "Coste parche"], ["ventaParche", "Venta parche"], ["costeMangaLarga", "Coste manga larga"], ["ventaMangaLarga", "Venta manga larga"], ["costeFijoPedido", "Coste fijo pedido"]];
export default function ConfiguracionScreen() {
  const [precios, setPrecios] = useState<ConfiguracionPrecios>({ ...PRECIOS_POR_DEFECTO }); const [mensaje, setMensaje] = useState("");
  async function cargar() { setPrecios(await cargarConfiguracionPrecios()); }
  useEffect(() => { cargar(); }, []);
  async function guardar() { await guardarConfiguracionPrecios(precios); setMensaje("Configuración guardada"); }
  return <ScrollView style={styles.screen}><Text style={styles.title}>Configuración de precios</Text>{CAMPOS.map(([campo, label]) => <PrecioInput key={campo} label={label} value={precios[campo]} onChange={(value) => setPrecios({ ...precios, [campo]: value })} />)}{mensaje ? <Text style={styles.text}>{mensaje}</Text> : null}<Pressable style={styles.button} onPress={guardar}><Text style={styles.buttonText}>Guardar cambios</Text></Pressable><Pressable style={styles.secondaryButton} onPress={() => setPrecios({ ...PRECIOS_POR_DEFECTO })}><Text style={styles.secondaryText}>Restaurar valores por defecto</Text></Pressable><Pressable style={styles.secondaryButton} onPress={cargar}><Text style={styles.secondaryText}>Recargar desde Supabase</Text></Pressable></ScrollView>;
}
