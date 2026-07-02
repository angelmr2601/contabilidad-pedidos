import { NextResponse } from "next/server";
import { registrarTracking17Track } from "@/lib/tracking/17track";
import { createServerSupabaseClient, getBearerToken } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient(getBearerToken(request));
  try {
    const body = await request.json();
    const pedidoId = Number(body.pedidoId);
    const numero = String(body.numeroSeguimiento ?? "").trim();
    const codigo = String(body.transportistaCodigo ?? "").trim();
    const nombre = String(body.transportistaNombre ?? "").trim();
    if (!pedidoId || !numero || !codigo || !nombre) return NextResponse.json({ ok: false, error: "Faltan datos de seguimiento." }, { status: 400 });

    const { data: pedido, error: pedidoError } = await supabase.from("pedidos").select("id,archivado,tracking_estado_interno,numero_seguimiento").eq("id", pedidoId).single();
    if (pedidoError) throw pedidoError;
    if (pedido.archivado) return NextResponse.json({ ok: false, error: "Pedido archivado. No se puede registrar seguimiento." }, { status: 409 });
    if (pedido.tracking_estado_interno === "entregado") return NextResponse.json({ ok: false, error: "Seguimiento finalizado. El paquete ya fue recibido." }, { status: 409 });

    const { error: updateError } = await supabase.from("pedidos").update({ numero_seguimiento: numero, transportista_codigo: codigo, transportista_nombre: nombre, tracking_error: null }).eq("id", pedidoId);
    if (updateError) throw updateError;
    try {
      const track17 = await registrarTracking17Track({ number: numero, carrier: Number(codigo) });
      await supabase.from("pedidos").update({ tracking_registrado_at: new Date().toISOString(), tracking_error: null, tracking_datos: track17 }).eq("id", pedidoId);
      return NextResponse.json({ ok: true, registered: true, track17 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar en 17TRACK.";
      await supabase.from("pedidos").update({ tracking_error: message }).eq("id", pedidoId);
      return NextResponse.json({ ok: true, registered: false, warning: message });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error registrando tracking." }, { status: 500 });
  }
}
