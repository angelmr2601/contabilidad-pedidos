import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { aplicarActualizacionTracking } from "@/lib/tracking/procesar";

function extraerNumero(raw: unknown): string | null {
  const text = JSON.stringify(raw);
  const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  for (const key of ["number", "tracking_number", "numero_seguimiento"]) if (typeof obj[key] === "string") return obj[key] as string;
  const match = text.match(/"(?:number|tracking_number)"\s*:\s*"([^"]+)"/);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  const configured = process.env.TRACK17_WEBHOOK_SECRET;
  if (configured) {
    const url = new URL(request.url);
    const received = request.headers.get("x-track17-webhook-secret") ?? url.searchParams.get("secret");
    if (received !== configured) return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const raw = await request.json();
    const numero = extraerNumero(raw);
    if (!numero) return NextResponse.json({ ok: true, ignored: "tracking_number_missing" });
    const supabase = createServerSupabaseClient();
    const { data: pedido } = await supabase.from("pedidos").select("id,archivado,tracking_estado_interno").eq("numero_seguimiento", numero).maybeSingle();
    if (!pedido) return NextResponse.json({ ok: true, ignored: "pedido_not_found" });
    if (pedido.archivado) return NextResponse.json({ ok: true, ignored: "pedido_archivado" });
    if (pedido.tracking_estado_interno === "entregado") return NextResponse.json({ ok: true, ignored: "tracking_finalizado" });
    const result = await aplicarActualizacionTracking(pedido.id, raw);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error webhook." }, { status: 500 });
  }
}
