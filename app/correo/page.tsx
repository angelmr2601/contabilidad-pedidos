"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Msg = {
  id: string;
  from: { email: string; name?: string };
  to: { email: string }[];
  subject: string;
  excerpt?: string;
  date: string;
  read: boolean;
  hasAttachments: boolean;
  folder: string;
};

type MessageDetail = Msg & {
  recipients: string[];
  textBody: string;
  htmlBody: string;
  bodyUrl: string;
  attachments: { filename?: string; contentType?: string; sizeBytes?: number; fileUrl?: string }[];
  internalStatus: string;
};

type RelatedOrder = {
  id: number;
  numeroPedido: string;
  fechaPedido: string;
  estado: string;
  importe: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-ES");
}

export default function CorreoPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [related, setRelated] = useState<RelatedOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [folder, setFolder] = useState("inbox");
  const [query, setQuery] = useState("");
  const [read, setRead] = useState("todos");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? null,
    [messages, selectedId],
  );

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/hostinger-mail/messages?folder=${folder}&q=${encodeURIComponent(query)}&read=${read}`,
        { cache: "no-store" },
      );
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "No se pudo cargar el correo.");
      }

      setMessages(json.items ?? []);
      setNotice(json.pending ?? "");
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    setSelectedId(id);
    setLoadingDetail(true);
    setError("");
    window.history.replaceState(null, "", `/correo?message=${encodeURIComponent(id)}&folder=${folder}`);

    try {
      const response = await fetch(`/api/hostinger-mail/message?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "No se pudo cargar el detalle.");
      }

      setDetail(json.message);
      setRelated(json.related ?? []);
    } catch (detailError) {
      setError((detailError as Error).message);
      setDetail(null);
      setRelated([]);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get("message");
    const initialFolder = params.get("folder");

    if (initialFolder) {
      setFolder(initialFolder);
    }

    if (messageId) {
      setSelectedId(messageId);
      void loadDetail(messageId);
    }

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, read]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sending) return;

    setSending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/hostinger-mail/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const json = await response.json();

    setSending(false);

    if (!response.ok) {
      setError(json.error);
    } else {
      setNotice("Correo enviado.");
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-surface p-5 shadow-sm">
          <Link href="/" className="text-sm text-muted">← Pedidos</Link>
          <h1 className="mt-2 text-3xl font-bold">Correo</h1>
          <p className="text-sm text-muted">Gestión segura de Hostinger Mail desde el servidor.</p>
        </header>

        {notice && <div className="rounded-xl bg-surface-muted p-4 text-sm text-muted">{notice}</div>}
        {error && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={load} className="ml-3 underline">Reintentar</button>
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[220px_1fr_360px]">
          <aside className="rounded-2xl bg-surface p-4 shadow-sm">
            <h2 className="font-semibold">Carpetas</h2>
            {[["inbox", "Bandeja"], ["sent", "Enviados"], ["drafts", "Borradores"], ["archive", "Archivados"], ["spam", "Spam"], ["trash", "Papelera"]].map(([id, label]) => (
              <button key={id} onClick={() => setFolder(id)} className={`mt-2 block w-full rounded-xl px-3 py-2 text-left text-sm ${folder === id ? "bg-black text-white" : "bg-surface-subtle"}`}>
                {label}
              </button>
            ))}
          </aside>

          <section className="rounded-2xl bg-surface p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input aria-label="Buscar correo" value={query} onChange={(event) => setQuery(event.target.value)} className="flex-1 rounded-xl border border-border-strong bg-surface px-3 py-2" placeholder="Buscar" />
              <select aria-label="Filtro leído" value={read} onChange={(event) => setRead(event.target.value)} className="rounded-xl border border-border-strong bg-surface px-3 py-2">
                <option value="todos">Todos</option>
                <option value="unread">No leídos</option>
                <option value="read">Leídos</option>
              </select>
              <button onClick={load} className="rounded-xl bg-black px-4 py-2 text-white">Actualizar</button>
            </div>

            <div className="mt-4 space-y-2">
              {loading && <p className="rounded-xl border border-dashed p-8 text-center">Cargando correo...</p>}
              {!loading && messages.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-muted">No hay mensajes para mostrar.</p>}
              {messages.map((message) => (
                <button key={message.id} onClick={() => loadDetail(message.id)} className={`block w-full rounded-xl border p-3 text-left focus:outline ${selectedId === message.id ? "border-foreground" : "border-border-strong"}`}>
                  <div className="flex justify-between gap-2">
                    <strong>{message.from.name || message.from.email}</strong>
                    <span className="text-xs text-muted">{formatDate(message.date)}</span>
                  </div>
                  <p className={message.read ? "" : "font-bold"}>{message.subject || "Sin asunto"}</p>
                  <p className="text-sm text-muted">{message.excerpt}</p>
                  <p className="text-xs text-muted">{message.folder}{message.hasAttachments ? " · adjuntos" : ""}</p>
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl bg-surface p-4 shadow-sm">
              <h2 className="font-semibold">Detalle</h2>
              {loadingDetail && <p className="mt-3 text-sm text-muted">Cargando mensaje...</p>}
              {!loadingDetail && !detail && <p className="mt-3 text-sm text-muted">Selecciona un mensaje para ver remitente, cuerpo y adjuntos.</p>}
              {detail && (
                <div className="mt-3 space-y-3 text-sm">
                  <p><span className="font-semibold">De:</span> {detail.from.name ? `${detail.from.name} <${detail.from.email}>` : detail.from.email}</p>
                  <p><span className="font-semibold">Para:</span> {detail.recipients.join(", ") || "No disponible"}</p>
                  <p><span className="font-semibold">Fecha:</span> {formatDate(detail.date)}</p>
                  <p><span className="font-semibold">Asunto:</span> {detail.subject || selectedMessage?.subject || "Sin asunto"}</p>
                  <div className="rounded-xl bg-surface-muted p-3 whitespace-pre-wrap">{detail.textBody || detail.excerpt || "Sin cuerpo de texto disponible."}</div>
                  {detail.bodyUrl && <p><a className="underline" href={detail.bodyUrl} target="_blank" rel="noreferrer">Abrir cuerpo completo firmado</a></p>}
                  {detail.attachments.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Adjuntos</h3>
                      <ul className="mt-2 space-y-1">
                        {detail.attachments.map((attachment, index) => (
                          <li key={`${attachment.filename}-${index}`}>
                            {attachment.fileUrl ? <a className="underline" href={attachment.fileUrl} target="_blank" rel="noreferrer">{attachment.filename || "Adjunto"}</a> : attachment.filename || "Adjunto"}
                            {attachment.sizeBytes ? ` · ${attachment.sizeBytes} bytes` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-surface p-4 shadow-sm">
              <h2 className="font-semibold">Cliente y pedidos</h2>
              {related.length === 0 && <p className="mt-1 text-sm text-muted">No hay pedidos relacionados para este remitente.</p>}
              {related.map((order) => (
                <Link key={order.id} href="/" className="mt-2 block rounded-xl bg-surface-muted p-3 text-sm">
                  <span className="font-semibold">Pedido #{order.numeroPedido || order.id}</span>
                  <br />{order.fechaPedido} · {order.estado} · {order.importe.toFixed(2)} €
                </Link>
              ))}
            </section>

            <section className="rounded-2xl bg-surface p-4 shadow-sm">
              <h2 className="font-semibold">Redactar</h2>
              <form onSubmit={send} className="mt-3 space-y-3">
                <input name="to" aria-label="Para" placeholder="Para" className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2" />
                <input name="cc" aria-label="CC" placeholder="CC" className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2" />
                <input name="bcc" aria-label="CCO" placeholder="CCO" className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2" />
                <input name="subject" aria-label="Asunto" placeholder="Asunto" className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2" />
                <textarea name="text" aria-label="Cuerpo" rows={6} className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2" />
                <button disabled={sending} className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">{sending ? "Enviando..." : "Enviar"}</button>
              </form>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
