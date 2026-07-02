import type { Track17Registro } from "./tipos";

const API_BASE = "https://api.17track.net/track/v2.2";

function apiKey() {
  const key = process.env.TRACK17_API_KEY;
  if (!key) throw new Error("Falta TRACK17_API_KEY en el backend.");
  return key;
}

async function request17Track(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "17token": apiKey(), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`17TRACK ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export function transportistas17Track() {
  return [
    { codigo: process.env.TRACK17_CARRIER_CODE_1 ?? "191666", nombre: process.env.TRACK17_CARRIER_NAME_1 ?? "Hexi International" },
    { codigo: process.env.TRACK17_CARRIER_CODE_2 ?? "190688", nombre: process.env.TRACK17_CARRIER_NAME_2 ?? "LDGJ" },
  ];
}

export async function registrarTracking17Track(input: Track17Registro) {
  return request17Track("/register", [{ number: input.number, carrier: input.carrier }]);
}

export async function consultarTracking17Track(input: Track17Registro) {
  return request17Track("/gettrackinfo", [{ number: input.number, carrier: input.carrier }]);
}
