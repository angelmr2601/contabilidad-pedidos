import { calcularProducto } from "./calculos";
import { PRECIOS_POR_DEFECTO } from "./precios";
import type {
  ConfiguracionPrecios,
  Producto,
  TallaProducto,
  TipoProducto,
} from "../types";

type ResultadoImportacion = {
  productos: Producto[];
  errores: string[];
};

const TALLAS_VALIDAS: TallaProducto[] = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
];

function normalizarTexto(valor: string) {
  return valor.trim().toLowerCase();
}

function parsearDinero(valor: string) {
  const limpio = valor
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();

  const numero = Number(limpio);

  return Number.isFinite(numero) ? numero : null;
}

function pareceDinero(valor: string) {
  return /€|\d+[,.]\d{1,2}/.test(valor);
}

function dividirLinea(linea: string) {
  if (linea.includes("\t")) {
    return linea.split("\t").map((columna) => columna.trim());
  }

  if (linea.includes(";")) {
    return linea.split(";").map((columna) => columna.trim());
  }

  return linea
    .split(/\s{2,}/)
    .map((columna) => columna.trim())
    .filter(Boolean);
}

function normalizarTalla(valor: string): TallaProducto {
  const talla = valor.trim().toUpperCase();

  if (TALLAS_VALIDAS.includes(talla as TallaProducto)) {
    return talla as TallaProducto;
  }

  return "M";
}

function normalizarTipo(valor: string): TipoProducto {
  const tipo = normalizarTexto(valor);

  if (tipo.includes("player") || tipo.includes("jugador")) {
    return "Player";
  }

  if (tipo.includes("retro") || tipo.includes("vintage")) {
    return "Retro";
  }

  if (
    tipo.includes("infantil") ||
    tipo.includes("niño") ||
    tipo.includes("nino")
  ) {
    return "Infantil";
  }

  if (tipo.includes("personalizada") || tipo.includes("custom")) {
    return "Personalizada";
  }

  if (tipo.includes("fan") || tipo.includes("hincha")) {
    return "Fan";
  }

  return "Personalizada";
}

function esMangaLarga(valor: string): boolean {
  const manga = normalizarTexto(valor);

  return manga.includes("larga");
}

function parsearBooleano(valor: string) {
  const texto = normalizarTexto(valor);

  return (
    texto === "sí" ||
    texto === "si" ||
    texto === "yes" ||
    texto === "true" ||
    texto === "1"
  );
}

function calcularPrecioRegla(
  producto: Producto,
  precios: ConfiguracionPrecios,
) {
  const calculo = calcularProducto(producto, precios);

  return {
    coste: calculo.costeTotal,
    venta: calculo.ventaTotal,
  };
}

function numerosIguales(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

function esFilaCabecera(columnas: string[]) {
  const texto = columnas.join(" ").toLowerCase();

  return (
    texto.includes("cliente") &&
    texto.includes("producto") &&
    texto.includes("talla")
  );
}

export function importarProductosDesdeTexto(
  texto: string,
  idInicial = 1,
  precios: ConfiguracionPrecios = PRECIOS_POR_DEFECTO,
): ResultadoImportacion {
  const lineas = texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  const productos: Producto[] = [];
  const errores: string[] = [];

  lineas.forEach((linea, index) => {
    const columnas = dividirLinea(linea);

    if (columnas.length === 0 || esFilaCabecera(columnas)) {
      return;
    }

    if (columnas.length < 6) {
      errores.push(
        `Línea ${index + 1}: faltan columnas. Mínimo esperado: cliente, producto, talla, tipo, manga y personalización.`,
      );
      return;
    }

    const indicesDinero = columnas
      .map((columna, indice) => (pareceDinero(columna) ? indice : -1))
      .filter((indice) => indice >= 0);

    let costeManual: number | null = null;
    let ventaManual: number | null = null;
    let indiceCoste = -1;

    if (indicesDinero.length >= 3) {
      indiceCoste = indicesDinero[indicesDinero.length - 3];
      const indiceVenta = indicesDinero[indicesDinero.length - 2];

      costeManual = parsearDinero(columnas[indiceCoste]);
      ventaManual = parsearDinero(columnas[indiceVenta]);
    } else if (indicesDinero.length >= 2) {
      indiceCoste = indicesDinero[indicesDinero.length - 2];
      const indiceVenta = indicesDinero[indicesDinero.length - 1];

      costeManual = parsearDinero(columnas[indiceCoste]);
      ventaManual = parsearDinero(columnas[indiceVenta]);
    }

    const cliente = columnas[0] ?? "";
    const nombreBase = columnas[1] ?? "";
    const talla = normalizarTalla(columnas[2] ?? "");
    const tipoOriginal = normalizarTipo(columnas[3] ?? "");
    const mangaLarga = esMangaLarga(columnas[4] ?? "");
    const personalizacion = parsearBooleano(columnas[5] ?? "");

    const extras =
      indiceCoste > 6
        ? columnas
            .slice(6, indiceCoste)
            .filter((valor) => valor && !pareceDinero(valor))
            .join(" - ")
        : "";

    const parche = normalizarTexto(extras).includes("parche");
    const nombre = extras ? `${nombreBase} - ${extras}` : nombreBase;

    const producto: Producto = {
      id: idInicial + productos.length,
      cliente,
      nombre,
      talla,
      tipo: tipoOriginal,
      personalizacion,
      parche,
      parcheNombre: parche ? extras : "",
      mangaLarga,
      nombrePersonalizacion: "",
      numeroPersonalizacion: "",
      precioVentaManual: ventaManual ?? 0,
      costeManual: costeManual ?? 0,
      ventaUnidadSnapshot: null,
      costeUnidadSnapshot: null,
      pagado: false,
      entregado: false,
    };

    if (costeManual !== null && ventaManual !== null) {
      const precioRegla = calcularPrecioRegla(producto, precios);

      if (
        !numerosIguales(precioRegla.coste, costeManual) ||
        !numerosIguales(precioRegla.venta, ventaManual)
      ) {
        errores.push(
          `Línea ${index + 1}: el precio pegado no coincide con la configuración actual; se importan los precios configurados por la app.`,
        );
      }
    }

    productos.push(producto);
  });

  return {
    productos,
    errores,
  };
}
