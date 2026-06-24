import { NextRequest, NextResponse } from "next/server";

import { parseWebhookPayload } from "../../../../lib/hostinger-mail/schemas";

const seen = new Set<string>();

function bearer(header: string | null) {
  const [scheme, token] = (header ?? "").split(" ");
  return scheme === "Bearer" ? token : null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.HOSTINGER_MAIL_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 });
  }

  if (bearer(request.headers.get("authorization")) !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const payload = parseWebhookPayload(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: "Evento no soportado." }, { status: 400 });
  }

  const stableId = payload.id ?? payload.message?.id;

  if (stableId) {
    if (seen.has(stableId)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    seen.add(stableId);
  }

  return NextResponse.json({ ok: true });
}
