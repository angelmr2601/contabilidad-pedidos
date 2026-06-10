const CTT_EXPRESS_LOCALIZADOR_URL =
  "https://www.cttexpress.com/localizador-de-envios/";

export function crearEnlaceSeguimientoCttExpress(numeroSeguimiento: string) {
  const seguimiento = numeroSeguimiento.trim();

  if (!seguimiento) {
    return "";
  }

  return `${CTT_EXPRESS_LOCALIZADOR_URL}?sc=${encodeURIComponent(seguimiento)}`;
}
