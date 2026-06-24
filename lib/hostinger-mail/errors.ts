export class HostingerMailError extends Error {
  status: number;
  code: string;
  correlationId?: string;

  constructor(
    message: string,
    status: number,
    code = "HOSTINGER_MAIL_ERROR",
    correlationId?: string,
  ) {
    super(message);
    this.name = "HostingerMailError";
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
  }
}

export class HostingerMailConfigError extends HostingerMailError {
  constructor(message = "La integración de correo no está configurada.") {
    super(message, 500, "HOSTINGER_MAIL_CONFIG");
  }
}

export function messageForStatus(status: number) {
  if (status === 401) return "Token de Hostinger Mail no autorizado.";
  if (status === 403) return "El token no tiene permisos suficientes.";
  if (status === 404) return "El recurso de correo no existe.";
  if (status === 409) return "La operación de correo entra en conflicto con el estado actual.";
  if (status === 422) return "Los datos enviados a correo no son válidos.";
  if (status === 429) return "Límite de peticiones de Hostinger Mail alcanzado. Inténtalo más tarde.";
  if (status >= 500) return "Hostinger Mail no está disponible temporalmente.";
  return "No se pudo completar la operación de correo.";
}
