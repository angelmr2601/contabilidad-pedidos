import { supabase } from "../supabase.ts";
import type { HostingerMessageSummary, WebhookPayload } from "./types.ts";

type MailStatusRow = {
  message_id: string;
  mailbox: string;
  status: "pendiente" | "en_proceso" | "respondido";
  sender_email: string | null;
  sender_name: string | null;
  subject: string | null;
  excerpt: string | null;
  received_at: string | null;
  updated_at: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function firstString(value: unknown) {
  return Array.isArray(value) ? asString(value[0]) : asString(value);
}

function addressFromPayload(message: Record<string, unknown> | undefined) {
  const from = message?.from ?? message?.from_ ?? message?.sender;

  if (typeof from === "string") {
    return { email: from, name: undefined };
  }

  if (Array.isArray(from)) {
    const first = from[0];

    if (typeof first === "string") {
      return { email: first, name: undefined };
    }

    if (first && typeof first === "object") {
      const data = first as Record<string, unknown>;
      return {
        email: asString(data.email || data.address),
        name: asString(data.name) || undefined,
      };
    }
  }

  if (from && typeof from === "object") {
    const data = from as Record<string, unknown>;
    return {
      email: asString(data.email || data.address),
      name: asString(data.name) || undefined,
    };
  }

  return { email: "", name: undefined };
}

export function webhookPayloadToRow(payload: WebhookPayload) {
  const message =
    payload.message && typeof payload.message === "object"
      ? (payload.message as Record<string, unknown>)
      : undefined;
  const messageId =
    asString(payload.id) ||
    asString(payload.event_id) ||
    asString(message?.id) ||
    asString(message?.message_id);
  const mailbox =
    asString(message?.mailbox) || asString(message?.mailbox_id) || "default";
  const from = addressFromPayload(message);
  const timestamp =
    asString(message?.timestamp) ||
    asString(message?.received_at) ||
    new Date().toISOString();

  return {
    message_id: messageId,
    mailbox,
    status: "pendiente" as const,
    sender_email: from.email || null,
    sender_name: from.name ?? null,
    subject: asString(message?.subject),
    excerpt: firstString(
      message?.excerpt ||
        message?.truncated_message ||
        message?.snippet ||
        message?.text,
    ),
    received_at: timestamp,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertWebhookMessage(payload: WebhookPayload) {
  const row = webhookPayloadToRow(payload);

  if (!row.message_id) {
    return { stored: false, reason: "missing_message_id" as const };
  }

  const { error } = await supabase
    .from("hostinger_mail_message_statuses")
    .upsert(row, { onConflict: "message_id,mailbox" });

  if (error) {
    throw error;
  }

  return { stored: true as const };
}

function rowToSummary(row: MailStatusRow): HostingerMessageSummary {
  return {
    id: row.message_id,
    mailbox: row.mailbox,
    folder: "inbox",
    from: {
      email: row.sender_email ?? "remitente no disponible",
      name: row.sender_name ?? undefined,
    },
    to: [],
    subject: row.subject || "Sin asunto",
    excerpt:
      row.excerpt ||
      "Mensaje recibido por webhook. Abre Hostinger para ver el cuerpo completo hasta conectar el endpoint REST oficial.",
    date: row.received_at ?? row.updated_at,
    read: row.status === "respondido",
    hasAttachments: false,
  };
}

export async function listWebhookMessages({
  page,
  perPage,
  query,
  read,
}: {
  page: number;
  perPage: number;
  query: string;
  read: string;
}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  let request = supabase
    .from("hostinger_mail_message_statuses")
    .select(
      "message_id, mailbox, status, sender_email, sender_name, subject, excerpt, received_at, updated_at",
      { count: "exact" },
    )
    .order("received_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (query) {
    request = request.or(
      `subject.ilike.%${query}%,sender_email.ilike.%${query}%,excerpt.ilike.%${query}%`,
    );
  }

  if (read === "read") {
    request = request.eq("status", "respondido");
  } else if (read === "unread") {
    request = request.neq("status", "respondido");
  }

  const { data, error, count } = await request;

  if (error) {
    throw error;
  }

  return {
    items: ((data ?? []) as MailStatusRow[]).map(rowToSummary),
    page,
    perPage,
    total: count ?? 0,
    nextPage: count && to + 1 < count ? page + 1 : null,
  };
}
