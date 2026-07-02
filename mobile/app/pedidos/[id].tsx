import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Clipboard, FlatList, Modal, Pressable, Text, View } from "react-native";
import { ProductoCard } from "@/components/ProductoCard";
import { ProductoForm } from "@/components/ProductoForm";
import { AppHeader, Badge, BottomNav, Button, Card, EmptyState, Input } from "@/components/ui";
import { styles } from "@/components/styles";
import { calcularPedido, formatoEuros, formatoFecha } from "@/lib/calculos";
import { cargarConfiguracionPrecios } from "@/lib/configuracion-precios-db";
import { actualizarEstadoProducto, actualizarNumeroSeguimientoPedido, actualizarPedido, actualizarProducto, cargarPedidos, crearProducto, duplicarProducto, eliminarPedido, eliminarProducto, guardarArchivadoPedido } from "@/lib/pedidos-db";
import { alternarCampoProducto, crearProductoVacio, reemplazarProducto } from "@/lib/productos";
import { getSession } from "@/lib/auth";
import { getTrackingBadgeTone, getTrackingEstadoLabel, refrescarTrackingBackend, registrarTrackingBackend, TRACKING_CARRIERS } from "@/lib/tracking";
import type { ConfiguracionPrecios, Pedido, Producto } from "@/types";

export default function PedidoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>(); const pedidoId = Number(id);
  const [pedido, setPedido] = useState<Pedido | null>(null); const [precios, setPrecios] = useState<ConfiguracionPrecios | null>(null); const [editPedido, setEditPedido] = useState(false); const [producto, setProducto] = useState<Producto | null>(null);
  const [seguimientoModal, setSeguimientoModal] = useState(false); const [numeroSeguimiento, setNumeroSeguimiento] = useState(""); const [transportistaCodigo, setTransportistaCodigo] = useState<string>(TRACKING_CARRIERS[0].codigo); const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false); const [actualizandoTracking, setActualizandoTracking] = useState(false); const [errorSeguimiento, setErrorSeguimiento] = useState("");
  const cargar = useCallback(async () => { const [pedidos, c] = await Promise.all([cargarPedidos(), cargarConfiguracionPrecios()]); setPedido(pedidos.find((p) => p.id === pedidoId) ?? null); setPrecios(c); }, [pedidoId]);
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));
  const puedeGuardarProducto = useMemo(() => producto && precios, [producto, precios]);
  async function syncArchivado(nextProductos: Producto[]) {
    const archivado = await guardarArchivadoPedido(pedidoId, nextProductos);
    setPedido((actual) => actual ? { ...actual, archivado, productos: nextProductos } : actual);
    await cargar();
  }
  async function guardarProducto() {
    if (!puedeGuardarProducto || !producto || !precios || !pedido) return;
    let nextProductos: Producto[];
    if (producto.id < 0) {
      const creado = await crearProducto(pedidoId, producto, precios);
      nextProductos = [...pedido.productos, creado];
    } else {
      await actualizarProducto(producto, precios);
      nextProductos = reemplazarProducto(pedido.productos, producto);
    }
    setProducto(null);
    await syncArchivado(nextProductos);
  }
  async function confirmarDuplicado(item: Producto) {
    if (!pedido || !precios) return;
    Alert.alert("Duplicar producto", "Se creará una copia pendiente de pago y entrega.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Duplicar", onPress: async () => {
        const creado = await duplicarProducto(pedidoId, item, precios);
        await syncArchivado([...pedido.productos, creado]);
      } },
    ]);
  }
  function abrirSeguimiento() { setNumeroSeguimiento(pedido?.numeroSeguimiento ?? ""); setTransportistaCodigo(pedido?.transportistaCodigo ?? TRACKING_CARRIERS[0].codigo); setErrorSeguimiento(""); setSeguimientoModal(true); }
  async function guardarSeguimiento() { if (!pedido) return; setGuardandoSeguimiento(true); setErrorSeguimiento(""); try { const transportista = TRACKING_CARRIERS.find((c) => c.codigo === transportistaCodigo) ?? TRACKING_CARRIERS[0]; const actualizado = await actualizarNumeroSeguimientoPedido(pedido.id, numeroSeguimiento, transportista); setPedido(actualizado); const session = await getSession(); await registrarTrackingBackend(session, { pedidoId: pedido.id, numeroSeguimiento, transportistaCodigo: transportista.codigo, transportistaNombre: transportista.nombre }); await cargar(); setSeguimientoModal(false); } catch (error) { setErrorSeguimiento(error instanceof Error ? error.message : "No se pudo guardar el seguimiento."); } finally { setGuardandoSeguimiento(false); } }
  async function eliminarSeguimiento() { if (!pedido) return; try { const actualizado = await actualizarNumeroSeguimientoPedido(pedido.id, null); setPedido(actualizado); } catch (error) { Alert.alert("Seguimiento", error instanceof Error ? error.message : "No se pudo eliminar el número de seguimiento."); } }
  function copiarSeguimiento() { if (!pedido?.numeroSeguimiento) return; Clipboard.setString(pedido.numeroSeguimiento); Alert.alert("Seguimiento", "Número de seguimiento copiado."); }
  async function actualizarTracking() { if (!pedido) return; setActualizandoTracking(true); try { await refrescarTrackingBackend(await getSession(), pedido.id); await cargar(); } catch (error) { Alert.alert("Seguimiento", error instanceof Error ? error.message : "No se pudo actualizar el estado."); } finally { setActualizandoTracking(false); } }
  if (!pedido || !precios) return <View style={styles.screen}><EmptyState title="Cargando pedido" body="Preparando productos, pagos y entregas." /></View>;
  const total = calcularPedido(pedido, precios);
  const trackingFinalizado = pedido.trackingEstadoInterno === "entregado";
  const trackingCerrado = pedido.archivado || trackingFinalizado;
  return <View style={styles.screenWithNav}><FlatList data={pedido.productos} keyExtractor={(p) => String(p.id)} renderItem={({ item }) => <ProductoCard producto={item} precios={precios} onTogglePagado={async () => { const next = alternarCampoProducto(pedido.productos, item.id, "pagado"); await actualizarEstadoProducto(item.id, { pagado: !item.pagado }); await syncArchivado(next); }} onToggleEntregado={async () => { const next = alternarCampoProducto(pedido.productos, item.id, "entregado"); await actualizarEstadoProducto(item.id, { entregado: !item.entregado }); await syncArchivado(next); }} onEdit={() => setProducto(item)} onDuplicate={() => confirmarDuplicado(item)} onDelete={async () => { const next = pedido.productos.filter((p) => p.id !== item.id); await eliminarProducto(item.id); await syncArchivado(next); }} />} ListHeaderComponent={<><AppHeader title={pedido.nombre} subtitle={`${formatoFecha(pedido.fechaPedido)} · Detalle del pedido`} /><Card elevated><View style={styles.between}><View style={{ flex: 1 }}>{editPedido ? <><Input value={pedido.nombre} onChangeText={(nombre) => setPedido({ ...pedido, nombre })} /><Input value={pedido.fechaPedido} onChangeText={(fechaPedido) => setPedido({ ...pedido, fechaPedido })} /></> : <><Text style={styles.subtitle}>{pedido.nombre}</Text><Text style={styles.muted}>{formatoFecha(pedido.fechaPedido)}</Text></>}</View><Badge tone={pedido.archivado ? "muted" : "neon"}>{pedido.archivado ? "Archivado" : "Activo"}</Badge></View><View style={styles.statGrid}><View style={styles.stat}><Text style={styles.statLabel}>Venta</Text><Text style={styles.statValue}>{formatoEuros(total.totalVenta)}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>Pendiente</Text><Text style={styles.warning}>{formatoEuros(total.pendienteCobro)}</Text></View></View><View style={styles.row}><Button onPress={async () => { if (editPedido) await actualizarPedido(pedido.id, pedido.nombre, pedido.fechaPedido); setEditPedido(!editPedido); }}>{editPedido ? "Guardar" : "Editar pedido"}</Button><Button variant="secondary" onPress={() => setProducto(crearProductoVacio())}>Añadir producto</Button><Button variant="danger" onPress={() => Alert.alert("¿Eliminar pedido?", "Esta acción no se puede deshacer.", [{ text: "Cancelar" }, { text: "Eliminar", style: "destructive", onPress: async () => { await eliminarPedido(pedido.id); router.replace("/pedidos"); } }])}>Eliminar</Button></View></Card><Card><Text style={styles.eyebrow}>Seguimiento</Text>{pedido.numeroSeguimiento ? <><View style={styles.between}><View><Text style={styles.statLabel}>Estado</Text><Text style={styles.statValue}>{getTrackingEstadoLabel(pedido.trackingEstadoInterno)}</Text></View><Badge tone={pedido.archivado ? "muted" : getTrackingBadgeTone(pedido.trackingEstadoInterno)}>{pedido.archivado ? "Pedido archivado" : getTrackingEstadoLabel(pedido.trackingEstadoInterno)}</Badge></View>{trackingFinalizado ? <><Text style={styles.success}>El pedido ya ha llegado a ti.</Text><Text style={styles.muted}>Seguimiento finalizado</Text></> : null}{pedido.archivado ? <><Text style={styles.muted}>El seguimiento está cerrado.</Text></> : null}<Text style={styles.statLabel}>Número de seguimiento</Text><Text style={[styles.statValue, { marginBottom: 8 }]}>{pedido.numeroSeguimiento}</Text><Text style={styles.muted}>Transportista: {pedido.transportistaNombre ?? "Sin transportista"}</Text>{pedido.trackingUltimoEvento ? <Text style={styles.muted}>Último evento: {pedido.trackingUltimoEvento}</Text> : null}{pedido.trackingUltimaUbicacion ? <Text style={styles.muted}>Ubicación: {pedido.trackingUltimaUbicacion}</Text> : null}<Text style={styles.muted}>Actualizado: {formatoFecha(pedido.trackingActualizadoAt)}</Text>{pedido.trackingError ? <Text style={styles.error}>{pedido.trackingError}</Text> : null}<View style={styles.row}><Button onPress={abrirSeguimiento} disabled={trackingCerrado}>Editar seguimiento</Button><Button variant="secondary" onPress={actualizarTracking} disabled={actualizandoTracking || trackingCerrado}>{trackingCerrado ? "Seguimiento cerrado" : actualizandoTracking ? "Actualizando..." : "Actualizar estado"}</Button><Button variant="secondary" onPress={copiarSeguimiento}>Copiar</Button><Button variant="danger" onPress={() => Alert.alert("¿Eliminar seguimiento?", "Esta acción no se puede deshacer.", [{ text: "Cancelar" }, { text: "Eliminar", style: "destructive", onPress: eliminarSeguimiento }])}>Eliminar seguimiento</Button></View></> : <><Text style={[styles.muted, { marginBottom: 12 }]}>Sin seguimiento. Añade un número para recibir actualizaciones.</Text><Button onPress={abrirSeguimiento}>Añadir seguimiento</Button></>}</Card><Text style={[styles.subtitle, { marginTop: 10 }]}>Productos</Text></>} ListEmptyComponent={<EmptyState title="Sin productos" body="Añade el primer producto para empezar a controlar este pedido." action={<Button onPress={() => setProducto(crearProductoVacio())}>Añadir producto</Button>} />} contentContainerStyle={{ paddingBottom: 120 }} />
  <Modal visible={Boolean(producto)} animationType="slide"><View style={styles.screen}>{producto ? <ProductoForm producto={producto} precios={precios} onChange={setProducto} /> : null}<Button onPress={guardarProducto}>Guardar</Button><Button variant="secondary" onPress={() => setProducto(null)}>Cancelar</Button></View></Modal>
  <Modal visible={seguimientoModal} animationType="slide" transparent><View style={styles.modalBackdrop}><Card elevated style={styles.modalCard}><Text style={styles.eyebrow}>Seguimiento</Text><Text style={styles.subtitle}>{pedido.numeroSeguimiento ? "Editar seguimiento" : "Añadir seguimiento"}</Text><Input value={numeroSeguimiento} onChangeText={setNumeroSeguimiento} placeholder="Número de seguimiento" autoCapitalize="characters" editable={!guardandoSeguimiento} /><Text style={styles.label}>Transportista</Text><View style={styles.row}>{TRACKING_CARRIERS.map((carrier) => <Pressable key={carrier.codigo} onPress={() => setTransportistaCodigo(carrier.codigo)} style={[styles.segment, transportistaCodigo === carrier.codigo && styles.segmentActive]}><Text style={[styles.segmentText, transportistaCodigo === carrier.codigo && styles.segmentTextActive]}>{carrier.nombre}</Text></Pressable>)}</View>{errorSeguimiento ? <Text style={styles.error}>{errorSeguimiento}</Text> : null}<View style={styles.row}><Button onPress={guardarSeguimiento} disabled={guardandoSeguimiento}>{guardandoSeguimiento ? "Registrando..." : "Registrar en 17TRACK"}</Button><Button variant="secondary" onPress={() => setSeguimientoModal(false)} disabled={guardandoSeguimiento}>Cancelar</Button></View></Card></View></Modal><BottomNav /></View>;
}
