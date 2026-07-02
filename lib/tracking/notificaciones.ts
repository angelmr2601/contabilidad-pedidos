import { getTrackingEstadoLabel } from "./normalizar";
import type { TrackingEstadoInterno } from "./tipos";

type PushTokenRow = { expo_push_token: string };

export async function enviarPushExpo(tokens: PushTokenRow[], pedido: { id: number; nombre: string }, estado: TrackingEstadoInterno) {
  if (!tokens.length) return { sent: 0 };
  const esPaqueteRecibido = estado === "entregado";
  const mensajes = tokens.map(({ expo_push_token }) => ({
    to: expo_push_token,
    sound: "default",
    channelId: "tracking",
    title: esPaqueteRecibido ? "Paquete recibido" : "Pedido actualizado",
    body: esPaqueteRecibido ? `El pedido ${pedido.nombre} ya ha llegado.` : `Nuevo estado: ${getTrackingEstadoLabel(estado)}`,
    data: { pedidoId: String(pedido.id), type: "tracking_update" },
  }));
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(mensajes),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Expo push ${res.status}: ${JSON.stringify(data)}`);
  return { sent: mensajes.length, data };
}
