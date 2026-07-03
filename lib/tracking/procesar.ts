import { createServerSupabaseClient } from "@/lib/supabase-server";
import { normalizarEstado17Track } from "./normalizar";
import { enviarPushExpo } from "./notificaciones";

export async function aplicarActualizacionTracking(pedidoId: number, raw: unknown) {
  const supabase = createServerSupabaseClient();
  const { data: pedido, error } = await supabase.from("pedidos").select("id,nombre,archivado,tracking_estado,tracking_subestado,tracking_estado_interno,numero_seguimiento").eq("id", pedidoId).single();
  if (error) throw error;
  if (pedido.archivado) return { changed: false, ignored: "archivado" };
  if (pedido.tracking_estado_interno === "entregado") return { changed: false, ignored: "tracking_finalizado" };

  const snapshot = normalizarEstado17Track(raw);
  const cambio = pedido.tracking_estado_interno !== snapshot.estadoInterno || pedido.tracking_estado !== snapshot.estado || pedido.tracking_subestado !== snapshot.subestado;
  await supabase.from("pedidos").update({ tracking_estado: snapshot.estado, tracking_subestado: snapshot.subestado, tracking_estado_interno: snapshot.estadoInterno, tracking_ultimo_evento: snapshot.ultimoEvento, tracking_ultima_ubicacion: snapshot.ultimaUbicacion, tracking_actualizado_at: snapshot.actualizadoAt, tracking_error: null, tracking_datos: snapshot.raw }).eq("id", pedidoId);
  if (!cambio) return { changed: false, snapshot };

  const { data: existing } = await supabase.from("tracking_events").select("id").eq("pedido_id", pedidoId).eq("estado_nuevo", snapshot.estado).eq("subestado_nuevo", snapshot.subestado).eq("estado_interno_nuevo", snapshot.estadoInterno).eq("evento", snapshot.ultimoEvento).limit(1);
  if (existing?.length) return { changed: false, snapshot, deduped: true };

  const { data: event } = await supabase.from("tracking_events").insert({ pedido_id: pedidoId, estado_anterior: pedido.tracking_estado, estado_nuevo: snapshot.estado, subestado_anterior: pedido.tracking_subestado, subestado_nuevo: snapshot.subestado, estado_interno_anterior: pedido.tracking_estado_interno, estado_interno_nuevo: snapshot.estadoInterno, evento: snapshot.ultimoEvento, ubicacion: snapshot.ultimaUbicacion, raw: snapshot.raw }).select("id").single();
  let notified = false;
  if (pedido.tracking_estado_interno !== snapshot.estadoInterno) {
    const { data: tokens } = await supabase.from("push_tokens").select("expo_push_token");
    await enviarPushExpo(tokens ?? [], { id: pedido.id, nombre: pedido.nombre }, snapshot.estadoInterno);
    notified = Boolean(tokens?.length);
    if (event?.id) await supabase.from("tracking_events").update({ notified }).eq("id", event.id);
  }
  return { changed: true, notified, snapshot };
}
