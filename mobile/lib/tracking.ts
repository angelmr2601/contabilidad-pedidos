import type { Session } from "@supabase/supabase-js";
import type { TrackingEstadoInterno } from "@/types";

export const TRACKING_CARRIERS = [
  { codigo: "191666", nombre: "Hexi International" },
  { codigo: "190688", nombre: "LDGJ" },
] as const;

const API_URL = process.env.EXPO_PUBLIC_APP_API_URL;

export function getTrackingEstadoLabel(estado: TrackingEstadoInterno | null | undefined): string {
  const labels: Record<TrackingEstadoInterno, string> = { sin_seguimiento: "Sin seguimiento", pendiente_informacion: "Pendiente de información", preparando_envio: "Preparando envío", de_camino: "En camino", en_espana: "En España", en_reparto: "En reparto", entregado: "Paquete recibido", incidencia: "Incidencia", devuelto: "Devuelto" };
  return estado ? labels[estado] : labels.sin_seguimiento;
}
export function getTrackingBadgeTone(estado: TrackingEstadoInterno | null | undefined) {
  if (estado === "entregado") return "success" as const;
  if (estado === "incidencia" || estado === "devuelto") return "danger" as const;
  if (estado === "en_reparto" || estado === "de_camino" || estado === "en_espana") return "blue" as const;
  if (estado === "pendiente_informacion" || estado === "preparando_envio") return "warning" as const;
  return "muted" as const;
}
async function backend(path: string, session: Session | null, body: unknown) {
  if (!API_URL) throw new Error("Falta EXPO_PUBLIC_APP_API_URL en mobile/.env");
  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "content-type": "application/json", ...(session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {}) }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok === false) throw new Error(data?.error ?? "Error del backend.");
  return data;
}
export function registrarTrackingBackend(session: Session | null, body: { pedidoId: number; numeroSeguimiento: string; transportistaCodigo: string; transportistaNombre: string }) { return backend("/api/tracking/register", session, body); }
export function refrescarTrackingBackend(session: Session | null, pedidoId: number) { return backend("/api/tracking/refresh", session, { pedidoId }); }
