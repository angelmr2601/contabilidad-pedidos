import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Text, View } from "react-native";
import { ProductoCard } from "@/components/ProductoCard";
import { ProductoForm } from "@/components/ProductoForm";
import { Button, Card, EmptyState, Input } from "@/components/ui";
import { styles } from "@/components/styles";
import { calcularPedidosConTotales, formatoEuros } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { PRECIOS_POR_DEFECTO } from "@/lib/precios";
import { crearProductoVacio } from "@/lib/productos";
import type { BorradorPedido, Producto } from "@/types";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function BorradorScreen() {
  const [nombre, setNombre] = useState("Borrador de pedido");
  const [fechaPedido, setFechaPedido] = useState(hoy());
  const [productos, setProductos] = useState<Producto[]>([]);
  const [precios, setPrecios] = useState(PRECIOS_POR_DEFECTO);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const siguienteIdTemporal = useRef(-1);

  useEffect(() => { cargarConfiguracionPrecios().then(setPrecios).catch(() => setPrecios(PRECIOS_POR_DEFECTO)); }, []);

  const pedido: BorradorPedido = useMemo(() => ({
    id: -1,
    nombre,
    fechaPedido,
    numeroSeguimiento: null,
    archivado: false,
    costeFijoSnapshot: precios.costeFijoPedido,
    productos,
  }), [fechaPedido, nombre, precios.costeFijoPedido, productos]);
  const total = calcularPedidosConTotales([pedido], precios)[0];

  function guardarProducto() {
    if (!productoEditando) return;
    setProductos((actuales) => productoEditando.id < 0 && !actuales.some((p) => p.id === productoEditando.id)
      ? [...actuales, productoEditando]
      : actuales.map((p) => p.id === productoEditando.id ? productoEditando : p));
    setProductoEditando(null);
  }

  function duplicarProducto(producto: Producto) {
    const copia: Producto = {
      ...producto,
      id: siguienteIdTemporal.current--,
      pagado: false,
      entregado: false,
    };
    setProductos((actuales) => [...actuales, copia]);
  }

  return <View style={styles.screen}><FlatList data={productos} keyExtractor={(p) => String(p.id)} renderItem={({ item }) => <ProductoCard producto={item} precios={precios} onTogglePagado={() => setProductos((actuales) => actuales.map((p) => p.id === item.id ? { ...p, pagado: !p.pagado } : p))} onToggleEntregado={() => setProductos((actuales) => actuales.map((p) => p.id === item.id ? { ...p, entregado: !p.entregado } : p))} onEdit={() => setProductoEditando(item)} onDuplicate={() => duplicarProducto(item)} onDelete={() => setProductos((actuales) => actuales.filter((p) => p.id !== item.id))} />} ListHeaderComponent={<><Text style={styles.eyebrow}>Simulador</Text><Text style={styles.title}>Borrador</Text><Card elevated><Text style={styles.muted}>Este borrador no se guarda. Sirve solo para calcular un pedido antes de crearlo.</Text><Text style={styles.label}>Nombre del borrador</Text><Input value={nombre} onChangeText={setNombre} placeholder="Nombre" /><Text style={styles.label}>Fecha</Text><Input value={fechaPedido} onChangeText={setFechaPedido} placeholder="YYYY-MM-DD" /><Button onPress={() => setProductoEditando(crearProductoVacio())}>Añadir producto</Button></Card><Card><Text style={styles.eyebrow}>Cálculo</Text><View style={styles.statGrid}><View style={styles.stat}><Text style={styles.statLabel}>Venta total</Text><Text style={styles.statValue}>{formatoEuros(total.totalVenta)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Coste productos</Text><Text style={styles.statValue}>{formatoEuros(total.costeProductos)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Coste fijo</Text><Text style={styles.statValue}>{formatoEuros(precios.costeFijoPedido)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Coste total</Text><Text style={styles.statValue}>{formatoEuros(total.totalCoste)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Beneficio</Text><Text style={styles.statValue}>{formatoEuros(total.beneficio)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Productos</Text><Text style={styles.statValue}>{productos.length}</Text></View></View></Card><Text style={styles.subtitle}>Productos simulados</Text></>} ListEmptyComponent={<EmptyState title="Sin productos simulados" body="Añade productos para calcular venta, costes y beneficio sin guardar en Supabase." action={<Button onPress={() => setProductoEditando(crearProductoVacio())}>Añadir producto</Button>} />} contentContainerStyle={{ paddingBottom: 32 }} />
    <Modal visible={Boolean(productoEditando)} animationType="slide"><View style={styles.screen}>{productoEditando ? <ProductoForm key={productoEditando.id} producto={productoEditando} precios={precios} onChange={setProductoEditando} /> : null}<Button onPress={guardarProducto}>Guardar producto</Button><Button variant="secondary" onPress={() => setProductoEditando(null)}>Cancelar</Button></View></Modal>
  </View>;
}
