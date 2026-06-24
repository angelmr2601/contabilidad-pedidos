import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(){ return NextResponse.json({ items: [], page: 1, perPage: 20, nextPage: null, pending: "La documentación pública verificada no expone rutas concretas de listado; conecta los endpoints oficiales cuando Hostinger publique el esquema OpenAPI accesible." }, { headers: { "cache-control":"no-store" } }); }
