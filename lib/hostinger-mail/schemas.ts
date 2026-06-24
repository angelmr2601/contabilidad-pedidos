import type { SendMailInput, WebhookPayload } from "./types.ts";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function splitEmails(value: string) {
  return value
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function validateSendMail(input: SendMailInput) {
  if (!input.to.length || input.to.some((email) => !emailRe.test(email))) {
    return "Añade al menos un destinatario válido.";
  }

  for (const list of [input.cc ?? [], input.bcc ?? []]) {
    if (list.some((email) => !emailRe.test(email))) {
      return "Revisa el formato de CC/CCO.";
    }
  }

  if (!input.subject.trim()) {
    return "Añade un asunto.";
  }

  if (!input.text.trim()) {
    return "Añade el cuerpo del mensaje.";
  }

  return null;
}

export function parseWebhookPayload(value: unknown): WebhookPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const event = payload.event ?? payload.event_type;

  if (event !== "message.received") {
    return null;
  }

  return payload as WebhookPayload;
}

export function sanitizeMailHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/<(iframe|object|embed|form|meta|link)[\s\S]*?<\/\1>/gi, "")
    .replace(/\s(src|srcset)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, " data-blocked-$1=$2");
}
