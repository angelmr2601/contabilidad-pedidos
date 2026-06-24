import { NextRequest, NextResponse } from "next/server";

import { parseWebhookPayload } from "../../../../lib/hostinger-mail/schemas";
import { upsertWebhookMessage } from "../../../../lib/hostinger-mail/status-db";

const seen = new Set<string>();

function bearer(header: string | null) {
  const [scheme, token] = (header ?? "").split(" ");
  return scheme === "Bearer" ? token : null;
}


export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "hostinger-mail-webhook",
      webhookSecretConfigured: Boolean(process.env.HOSTINGER_MAIL_WEBHOOK_SECRET),
      accepts: ["message.received"],
    },
    { headers: { "cache-control": "no-store" } },
  );
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

  try {
    const result = await upsertWebhookMessage(payload);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el metadato del correo." },
      { status: 202 },
    );
  }
}
