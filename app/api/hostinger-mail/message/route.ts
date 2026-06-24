import { NextRequest, NextResponse } from "next/server";

import { buscarPedidosPorEmail } from "../../../../lib/hostinger-mail/orders";
import { sanitizeMailHtml } from "../../../../lib/hostinger-mail/schemas";
import { getWebhookMessage } from "../../../../lib/hostinger-mail/status-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Falta el identificador del mensaje." }, { status: 400 });
  }

  try {
    const message = await getWebhookMessage(id);

    if (!message) {
      return NextResponse.json({ error: "No se encontró el mensaje." }, { status: 404 });
    }

    const related = message.from.email
      ? await buscarPedidosPorEmail(message.from.email).catch(() => [])
      : [];

    return NextResponse.json(
      {
        message,
        sanitizedHtml: sanitizeMailHtml(message.htmlBody ?? ""),
        related,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar el detalle del mensaje." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Acción pendiente: no hay endpoint oficial verificable desde la documentación pública accesible." },
    { status: 501 },
  );
}
