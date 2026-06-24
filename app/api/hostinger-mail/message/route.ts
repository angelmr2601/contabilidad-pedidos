import { NextRequest, NextResponse } from "next/server";
import { buscarPedidosPorEmail } from "../../../../lib/hostinger-mail/orders";
import { sanitizeMailHtml } from "../../../../lib/hostinger-mail/schemas";
export const dynamic = "force-dynamic";
export async function GET(request:NextRequest){ const id=request.nextUrl.searchParams.get("id"); const from=request.nextUrl.searchParams.get("from") ?? ""; if(!id) return NextResponse.json({error:"Falta el identificador del mensaje."},{status:400}); const related = from ? await buscarPedidosPorEmail(from) : []; return NextResponse.json({ message: null, sanitizedHtml: sanitizeMailHtml(""), related, pending:"Detalle pendiente de conectar a endpoint oficial verificado." }, { headers:{"cache-control":"no-store"} }); }
export async function PATCH(){ return NextResponse.json({ error:"Acción pendiente: no hay endpoint oficial verificable desde la documentación pública accesible." }, { status:501 }); }
