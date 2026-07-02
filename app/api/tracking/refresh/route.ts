import { NextResponse } from "next/server";
import { createServerSupabaseClient, getBearerToken } from "@/lib/supabase-server";
import { consultarTracking17Track } from "@/lib/tracking/17track";
import { aplicarActualizacionTracking } from "@/lib/tracking/procesar";

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient(getBearerToken(request));
  try {
    const { pedidoId } = await request.json();
    const { data: pedido, error } = await supabase.from("pedidos").select("id,archivado,numero_seguimiento,transportista_codigo,tracking_estado_interno").eq("id", Number(pedidoId)).single();
    if (error) throw error;
    if (pedido.archivado) return NextResponse.json({ ok: false, error: "Pedido archivado. No se actualiza el seguimiento." }, { status: 409 });
    if (pedido.tracking_estado_interno === "entregado") return NextResponse.json({ ok: false, error: "Seguimiento finalizado. El paquete ya fue recibido." }, { status: 409 });
    if (!pedido.numero_seguimiento) return NextResponse.json({ ok: false, error: "El pedido no tiene número de seguimiento." }, { status: 400 });
    const raw = await consultarTracking17Track({ number: pedido.numero_seguimiento, carrier: Number(pedido.transportista_codigo) });
    const result = await aplicarActualizacionTracking(pedido.id, raw);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error refrescando tracking." }, { status: 500 });
  }
}
