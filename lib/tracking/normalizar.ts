import type { TrackingEstadoInterno, TrackingSnapshot } from "./tipos";

const ESPANA_RE = /\b(españa|spain|madrid|barcelona|valencia|sevilla|zaragoza|málaga|malaga|murcia|palma|bilbao|alicante|córdoba|cordoba|valladolid|vigo|gijón|gijon|coruña|coruna|granada|tarragona|es)\b/i;
const FINALES = new Set<TrackingEstadoInterno>(["en_reparto", "entregado", "incidencia", "devuelto"]);

const INFO_RECIBIDA_RE = /(?:informaci[oó]n\s+electr[oó]nica\s+recibida|se\s+ha\s+recibido\s+informaci[oó]n\s+electr[oó]nica|electronic\s+information\s+received|shipment\s+information\s+received|info\s+received|order\s+data\s+received|datos\s+recibidos|received\s+shipment\s+information|received\s+electronic\s+information|inforeceived)/i;
const ENTREGA_FINAL_RE = /(?:\bdelivered\b|final\s+delivery|delivered\s+to\s+(?:recipient|consignee)|signed\s+by|已签收|签收|entregado\s+al\s+(?:destinatario|receptor)|entrega\s+completada|paquete\s+entregado)/i;
const DEVOLUCION_RE = /(?:return|returned|devuelto|devoluci[oó]n)/i;
const INCIDENCIA_RE = /(?:deliveryfailure|exception|expired|fail|failed|incidencia|fallo|error)/i;
const REPARTO_RE = /(?:availableforpickup|outfordelivery|out\s+for\s+delivery|reparto|en\s+reparto)/i;
const CAMINO_RE = /(?:intransit|in\s+transit|transit|transport|camino|aerol[ií]nea|airline|vuelo|flight|salida|sale\s+del\s+centro|centro\s+de\s+operaciones|aduaner|customs|despacho|carga\s+pasada|punto\s+de\s+recogida|llega\s+al\s+punto|启运|航空|清关|操作中心|揽收)/i;
const PREPARANDO_RE = /(?:preparing|preparando|informaci[oó]n\s+recibida|information\s+received)/i;

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

type EventoTracking = { texto: string; ubicacion: string | null; fecha: string | null; fechaMs: number | null };

function parseFecha(valor: string | null) {
  if (!valor) return null;
  const normalizada = valor.trim().replace(/^(\d{4})-(\d{1,2})-(\d{1,2})/, (_m, y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`).replace(" ", "T");
  const ms = new Date(normalizada).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function limpiarEvento(evento: string) {
  return evento.replace(/^\p{Script=Han}+[，,\s]*/u, "").trim();
}

function recolectarEventos(raw: unknown, eventos: EventoTracking[] = []): EventoTracking[] {
  if (!raw || typeof raw !== "object") return eventos;
  const obj = raw as Record<string, unknown>;
  const evento = texto(obj.description) ?? texto(obj.event) ?? texto(obj.evento) ?? texto(obj.latest_event) ?? texto(obj.latest_event_text) ?? texto(obj.track_info);
  if (evento) {
    const fecha = texto(obj.time) ?? texto(obj.date) ?? texto(obj.datetime) ?? texto(obj.event_time) ?? texto(obj.checkpoint_time) ?? texto(obj.created_at);
    const ubicacion = texto(obj.location) ?? texto(obj.ubicacion) ?? texto(obj.latest_location) ?? texto(obj.place);
    eventos.push({ texto: limpiarEvento(evento), ubicacion, fecha, fechaMs: parseFecha(fecha) });
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) value.forEach((item) => recolectarEventos(item, eventos));
    else if (value && typeof value === "object") recolectarEventos(value, eventos);
  }
  return eventos;
}

function eventoMasReciente(raw: unknown): EventoTracking | null {
  const eventos = recolectarEventos(raw);
  if (!eventos.length) return null;
  return eventos.sort((a, b) => (b.fechaMs ?? 0) - (a.fechaMs ?? 0))[0];
}

function normalizarInterno(combinado: string, ultimoEvento: string | null): TrackingEstadoInterno {
  const esInfoRecibida = INFO_RECIBIDA_RE.test(combinado);
  const tieneMovimientoFisico = CAMINO_RE.test(combinado) || REPARTO_RE.test(combinado);
  const entregaFinalEstricta = ENTREGA_FINAL_RE.test(ultimoEvento ?? "") || (!esInfoRecibida && ENTREGA_FINAL_RE.test(combinado));

  if (entregaFinalEstricta) return "entregado";
  if (DEVOLUCION_RE.test(combinado)) return "devuelto";
  if (INCIDENCIA_RE.test(combinado)) return "incidencia";
  if (REPARTO_RE.test(combinado)) return "en_reparto";
  if (tieneMovimientoFisico) return "de_camino";
  if (esInfoRecibida || PREPARANDO_RE.test(combinado)) return "preparando_envio";
  if (/notfound|not found/i.test(combinado)) return "pendiente_informacion";
  return "pendiente_informacion";
}

export function normalizarEstado17Track(raw: unknown): TrackingSnapshot {
  const eventoReciente = eventoMasReciente(raw);
  const estado = buscar(raw, ["status", "estado", "delivery_status", "delivery_status_text", "track_status"]) ?? "NotFound";
  const subestado = buscar(raw, ["substatus", "subestado", "sub_status", "delivery_substatus"]);
  const ultimoEvento = eventoReciente?.texto ?? buscar(raw, ["description", "event", "evento", "latest_event", "latest_event_text", "track_info"]);
  const ultimaUbicacion = eventoReciente?.ubicacion ?? buscar(raw, ["location", "ubicacion", "latest_location", "place"]);
  const combinado = [estado, subestado, ultimoEvento, ultimaUbicacion, JSON.stringify(raw)].filter(Boolean).join(" ");
  let estadoInterno = normalizarInterno(combinado, ultimoEvento);
  if (!FINALES.has(estadoInterno) && ESPANA_RE.test(combinado)) estadoInterno = "en_espana";
  return { estado, subestado, estadoInterno, ultimoEvento, ultimaUbicacion, actualizadoAt: eventoReciente?.fecha ?? new Date().toISOString(), raw };
}
