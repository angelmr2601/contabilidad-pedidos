import { NextRequest, NextResponse } from "next/server";

import { listWebhookMessages } from "../../../../lib/hostinger-mail/status-db";

export const dynamic = "force-dynamic";

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export async function GET(request: NextRequest) {
  const page = positiveInt(request.nextUrl.searchParams.get("page"), 1, 1000);
  const perPage = positiveInt(request.nextUrl.searchParams.get("perPage"), 20, 100);
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const read = request.nextUrl.searchParams.get("read") ?? "todos";

  try {
    const messages = await listWebhookMessages({ page, perPage, query, read });

    return NextResponse.json(messages, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los correos recibidos por webhook." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
