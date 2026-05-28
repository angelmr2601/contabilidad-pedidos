import type {
  MangaProducto,
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

  if (tipo.includes("retro") || tipo.includes("player")) {
    return "Retro/Player";
  }

  if (tipo.includes("fan")) {
    return "Fan";
  }

  return "Otro";
}

function normalizarManga(valor: string): MangaProducto {
  const manga = normalizarTexto(valor);

  if (manga.includes("larga")) {
    return "Larga";
  }

  return "Corta";
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

function calcularPrecioRegla(producto: Producto) {
  let coste = 0;
  let venta = 0;

  if (producto.tipo === "Fan") {
    coste = 6.5;
    venta = 15;
  }

  if (producto.tipo === "Retro/Player") {
    coste = 9.4;
    venta = 18;
  }

  if (producto.personalizacion) {
    coste += 2;
    venta += 2;
  }

  if (producto.manga === "Larga") {
    coste += 2;
    venta += 2;
  }

  return { coste, venta };
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
  idInicial = 1
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
        `Línea ${index + 1}: faltan columnas. Mínimo esperado: cliente, producto, talla, tipo, manga y personalización.`
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
    const manga = normalizarManga(columnas[4] ?? "");
    const personalizacion = parsearBooleano(columnas[5] ?? "");

    const extras =
      indiceCoste > 6
        ? columnas
            .slice(6, indiceCoste)
            .filter((valor) => valor && !pareceDinero(valor))
            .join(" - ")
        : "";

    const nombre = extras ? `${nombreBase} - ${extras}` : nombreBase;

    let producto: Producto = {
      id: idInicial + productos.length,
      cliente,
      nombre,
      talla,
      tipo: tipoOriginal,
      manga,
      personalizacion,
      nombrePersonalizacion: "",
      numeroPersonalizacion: "",
      precioVentaManual: 0,
      costeManual: 0,
      pagado: false,
      entregado: false,
    };

    if (
      costeManual !== null &&
      ventaManual !== null &&
      producto.tipo !== "Otro"
    ) {
      const precioRegla = calcularPrecioRegla(producto);

      const coincideConReglas =
        numerosIguales(precioRegla.coste, costeManual) &&
        numerosIguales(precioRegla.venta, ventaManual);

      if (!coincideConReglas) {
        producto = {
          ...producto,
          tipo: "Otro",
          personalizacion: false,
          nombrePersonalizacion: "",
          numeroPersonalizacion: "",
          costeManual,
          precioVentaManual: ventaManual,
        };
      }
    }

    if (
      costeManual !== null &&
      ventaManual !== null &&
      producto.tipo === "Otro"
    ) {
      producto = {
        ...producto,
        costeManual,
        precioVentaManual: ventaManual,
      };
    }

    productos.push(producto);
  });

  return {
    productos,
    errores,
  };
}