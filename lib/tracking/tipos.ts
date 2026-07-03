export type TrackingEstadoInterno =
  | "sin_seguimiento"
  | "pendiente_informacion"
  | "preparando_envio"
  | "de_camino"
  | "en_espana"
  | "en_reparto"
  | "entregado"
  | "incidencia"
  | "devuelto";

export type TrackingSnapshot = {
  estado: string | null;
  subestado: string | null;
  estadoInterno: TrackingEstadoInterno;
  ultimoEvento: string | null;
  ultimaUbicacion: string | null;
  actualizadoAt: string;
  raw: unknown;
};

export type Track17Registro = {
  number: string;
  carrier?: number;
};
