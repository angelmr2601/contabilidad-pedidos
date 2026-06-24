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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFindString(source: unknown, keys: string[]): string {
  for (const key of keys) {
    const queue: unknown[] = [source];
    const seen = new Set<unknown>();

    while (queue.length) {
      const current = queue.shift();

      if (!isRecord(current) || seen.has(current)) {
        continue;
      }

      seen.add(current);
      const value = current[key];

      if (typeof value === "string" && value.trim()) {
        return value;
      }

      if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
        return value[0];
      }

      for (const child of Object.values(current)) {
        if (isRecord(child) || Array.isArray(child)) {
          queue.push(child);
        }
      }
    }
  }

  return "";
}

function deepFindAddress(source: unknown) {
  const queue: unknown[] = [source];
  const seen = new Set<unknown>();
  const addressKeys = ["sender", "sender_email", "from", "from_", "from_email", "email_from"];

  while (queue.length) {
    const current = queue.shift();

    if (!isRecord(current) || seen.has(current)) {
      continue;
    }

    seen.add(current);
    const address = addressFromPayload(current);

    if (address.email) {
      return address;
    }

    for (const key of addressKeys) {
      const value = current[key];

      if (typeof value === "string" && value.trim()) {
        return parseAddressString(value);
      }

      if (Array.isArray(value) && value.length) {
        const first = value[0];

        if (typeof first === "string") {
          return parseAddressString(first);
        }

        if (isRecord(first)) {
          return {
            email: asString(first.email || first.address),
            name: asString(first.name) || undefined,
          };
        }
      }

      if (isRecord(value)) {
        return {
          email: asString(value.email || value.address),
          name: asString(value.name) || undefined,
        };
      }
    }

    for (const value of Object.values(current)) {
      if (isRecord(value) || Array.isArray(value)) {
        queue.push(value);
      }
    }
  }

  return { email: "", name: undefined };
}

function sanitizePayloadMetadata(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[max-depth]";
  }

  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  }

  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizePayloadMetadata(item, depth + 1));
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/[\s_-]*(html|body|content|attachment|raw|headers)[\s_-]*/i.test(key))
      .map(([key, item]) => [key, sanitizePayloadMetadata(item, depth + 1)])
      .filter(([, item]) => item !== undefined),
  );
}

function parseAddressString(value: string) {
  const match = value.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^<>\s]+@[^<>\s]+)>\s*$/);

  if (!match) {
    return { email: value, name: undefined };
  }

  return {
    email: match[2],
    name: match[1]?.trim() || undefined,
  };
}

function addressFromPayload(message: Record<string, unknown> | undefined) {
  const from = message?.from ?? message?.from_ ?? message?.sender;

  if (typeof from === "string") {
    return parseAddressString(from);
  }

  if (Array.isArray(from)) {
    const first = from[0];

    if (typeof first === "string") {
      return parseAddressString(first);
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
  const root = payload as Record<string, unknown>;
  const messageId =
    deepFindString(root, ["messageId", "message_id", "email_id", "mail_id", "id", "event_id"]) ||
    crypto.randomUUID();
  const mailbox =
    deepFindString(root, ["mailboxAddress", "mailbox", "mailbox_id", "mailbox_email", "account", "recipient"]) ||
    "default";
  const from = deepFindAddress(root);
  const timestamp =
    deepFindString(root, ["date", "received_at", "timestamp", "created_at"]) ||
    new Date().toISOString();

  return {
    message_id: messageId,
    mailbox,
    status: "pendiente" as const,
    sender_email: from.email || null,
    sender_name: from.name ?? null,
    subject: deepFindString(root, ["subject", "email_subject", "message_subject"]),
    excerpt: deepFindString(root, [
      "excerpt",
      "truncated_message",
      "snippet",
      "preview",
      "summary",
      "plainBody",
      "plainHtml",
      "text",
      "plain_text",
    ]),
    received_at: timestamp,
    updated_at: new Date().toISOString(),
    payload_metadata: sanitizePayloadMetadata(root),
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
