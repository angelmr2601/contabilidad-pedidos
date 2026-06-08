"use client";

import Icon from "./Icon";

import { useEffect, useState } from "react";

const CLAVE_TEMA = "tema";

function aplicarTema(oscuro: boolean) {
  document.documentElement.classList.toggle("dark", oscuro);
}

function leerPreferenciaOscura(): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);

    if (guardado === "oscuro") {
      return true;
    }

    if (guardado === "claro") {
      return false;
    }
  } catch {
    // localStorage no disponible
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [oscuro, setOscuro] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const preferenciaOscura = leerPreferenciaOscura();

    aplicarTema(preferenciaOscura);
    queueMicrotask(() => {
      setOscuro(preferenciaOscura);
      setListo(true);
    });
  }, []);

  function alternarTema() {
    const siguiente = !oscuro;

    setOscuro(siguiente);
    aplicarTema(siguiente);

    try {
      localStorage.setItem(CLAVE_TEMA, siguiente ? "oscuro" : "claro");
    } catch {
      // localStorage no disponible
    }
  }

  return (
    <button
      type="button"
      onClick={alternarTema}
      disabled={!listo}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="inline-flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:opacity-50"
    >
      <Icon name={oscuro ? "sun" : "moon"} className="h-5 w-5" />
      <span className="sr-only">
        {oscuro ? "Modo claro" : "Modo oscuro"}
      </span>
    </button>
  );
}
