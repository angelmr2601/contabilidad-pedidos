import type { TrackingEstadoInterno, TrackingSnapshot } from "./tipos";

const ESPANA_RE = /\b(españa|spain|madrid|barcelona|valencia|sevilla|zaragoza|málaga|malaga|murcia|palma|bilbao|alicante|córdoba|cordoba|valladolid|vigo|gijón|gijon|coruña|coruna|granada|tarragona|es)\b/i;
const FINALES = new Set<TrackingEstadoInterno>(["en_reparto", "entregado", "incidencia", "devuelto"]);

export function getTrackingEstadoLabel(estado: TrackingEstadoInterno | null | undefined): string {
  const labels: Record<TrackingEstadoInterno, string> = {
    sin_seguimiento: "Sin seguimiento",
    pendiente_informacion: "Pendiente de información",
    preparando_envio: "Preparando envío",
    de_camino: "En camino",
    en_espana: "En España",
    en_reparto: "En reparto",
    entregado: "Paquete recibido",
    incidencia: "Incidencia",
    devuelto: "Devuelto",
  };
  return estado ? labels[estado] : labels.sin_seguimiento;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function buscar(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(key.toLowerCase())) {
      const t = texto(value);
      if (t) return t;
    }
    if (typeof value === "object") {
      const nested = buscar(value, keys);
      if (nested) return nested;
    }
  }
  return null;
}

export function normalizarEstado17Track(raw: unknown): TrackingSnapshot {
  const estado = buscar(raw, ["status", "estado", "delivery_status", "delivery_status_text", "track_status"]) ?? "NotFound";
  const subestado = buscar(raw, ["substatus", "subestado", "sub_status", "delivery_substatus"]);
  const ultimoEvento = buscar(raw, ["description", "event", "evento", "latest_event", "latest_event_text", "track_info"]);
  const ultimaUbicacion = buscar(raw, ["location", "ubicacion", "latest_location", "place"]);
  const combinado = [estado, subestado, ultimoEvento, ultimaUbicacion, JSON.stringify(raw)].filter(Boolean).join(" ");
  let estadoInterno: TrackingEstadoInterno = "pendiente_informacion";
  if (/delivered/i.test(combinado)) estadoInterno = "entregado";
  else if (/deliveryfailure|exception|expired|fail|failed/i.test(combinado)) estadoInterno = "incidencia";
  else if (/return|returned|devuelto/i.test(combinado)) estadoInterno = "devuelto";
  else if (/availableforpickup|outfordelivery|pickup|reparto/i.test(combinado)) estadoInterno = "en_reparto";
  else if (/inforeceived|info received|preparing/i.test(combinado)) estadoInterno = "preparando_envio";
  else if (/intransit|transit|transport|camino/i.test(combinado)) estadoInterno = "de_camino";
  else if (/notfound|not found/i.test(combinado)) estadoInterno = "pendiente_informacion";
  if (!FINALES.has(estadoInterno) && ESPANA_RE.test(combinado)) estadoInterno = "en_espana";
  return { estado, subestado, estadoInterno, ultimoEvento, ultimaUbicacion, actualizadoAt: new Date().toISOString(), raw };
}
