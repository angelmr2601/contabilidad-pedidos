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

const folders = [
  ["inbox", "Recibidos", "📥"],
  ["sent", "Enviados", "📤"],
  ["drafts", "Borradores", "📝"],
  ["archive", "Archivados", "🗄️"],
  ["spam", "Spam", "⚠️"],
  ["trash", "Papelera", "🗑️"],
];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-ES");
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
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
  const [composeOpen, setComposeOpen] = useState(false);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? null,
    [messages, selectedId],
  );
  const unreadCount = messages.filter((message) => !message.read).length;

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

    if (initialFolder) setFolder(initialFolder);
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
      setComposeOpen(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#202124] dark:bg-[#0f1115] dark:text-[#e8eaed]">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#e0e3eb] bg-[#f6f8fc]/95 px-4 backdrop-blur dark:border-[#2b2f38] dark:bg-[#0f1115]/95">
        <Link href="/" className="rounded-full px-3 py-2 text-sm text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#bdc1c6] dark:hover:bg-[#202124]">
          ← Pedidos
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c2e7ff] text-xl">✉️</div>
        <h1 className="text-xl font-medium">Correo</h1>
        <div className="mx-auto hidden w-full max-w-3xl items-center gap-3 rounded-full bg-[#eaf1fb] px-5 py-3 shadow-sm dark:bg-[#1f2937] md:flex">
          <span className="text-[#5f6368] dark:text-[#bdc1c6]">🔎</span>
          <input
            aria-label="Buscar correo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && load()}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#5f6368] dark:placeholder:text-[#bdc1c6]"
            placeholder="Buscar en el correo"
          />
        </div>
        <button onClick={load} className="rounded-full p-3 text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#bdc1c6] dark:hover:bg-[#202124]" title="Actualizar">
          ↻
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-0 lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="border-r border-[#e0e3eb] bg-[#f6f8fc] px-3 py-4 dark:border-[#2b2f38] dark:bg-[#0f1115]">
          <button
            onClick={() => setComposeOpen(true)}
            className="mb-5 flex items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 py-4 text-sm font-medium text-[#001d35] shadow-sm transition hover:shadow-md"
          >
            <span className="text-lg">✏️</span>
            Redactar
          </button>

          <nav className="space-y-1">
            {folders.map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setFolder(id)}
                className={`flex w-full items-center justify-between rounded-r-full px-4 py-2 text-sm transition ${
                  folder === id
                    ? "bg-[#d3e3fd] font-semibold text-[#001d35] dark:bg-[#243b5a] dark:text-[#d3e3fd]"
                    : "text-[#202124] hover:bg-[#e8eaed] dark:text-[#e8eaed] dark:hover:bg-[#202124]"
                }`}
              >
                <span className="flex items-center gap-3"><span>{icon}</span>{label}</span>
                {id === "inbox" && unreadCount > 0 && <span className="text-xs">{unreadCount}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#e0e3eb] bg-white px-4 py-3 dark:border-[#2b2f38] dark:bg-[#15171c]">
            <div className="flex flex-1 items-center gap-3 rounded-full bg-[#f1f3f4] px-4 py-2 dark:bg-[#202124] md:hidden">
              <span>🔎</span>
              <input
                aria-label="Buscar correo móvil"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar"
              />
            </div>
            <select
              aria-label="Filtro leído"
              value={read}
              onChange={(event) => setRead(event.target.value)}
              className="rounded-full border border-transparent bg-[#f1f3f4] px-4 py-2 text-sm outline-none hover:bg-[#e8eaed] dark:bg-[#202124] dark:hover:bg-[#2b2f38]"
            >
              <option value="todos">Todos</option>
              <option value="unread">No leídos</option>
              <option value="read">Leídos</option>
            </select>
            <button onClick={load} className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1765cc]">Actualizar</button>
          </div>

          {notice && <div className="mx-4 mt-3 rounded-xl bg-[#e8f0fe] px-4 py-3 text-sm text-[#1967d2] dark:bg-[#172554] dark:text-[#bfdbfe]">{notice}</div>}
          {error && (
            <div role="alert" className="mx-4 mt-3 rounded-xl bg-[#fce8e6] px-4 py-3 text-sm text-[#c5221f] dark:bg-[#451a1a] dark:text-[#fecaca]">
              {error}
              <button onClick={load} className="ml-3 font-medium underline">Reintentar</button>
            </div>
          )}

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
            <section className="overflow-y-auto border-r border-[#e0e3eb] bg-white dark:border-[#2b2f38] dark:bg-[#15171c]">
              {loading && <p className="m-4 rounded-xl border border-dashed border-[#dadce0] p-8 text-center text-sm text-[#5f6368] dark:border-[#3c4043] dark:text-[#bdc1c6]">Cargando correo...</p>}
              {!loading && messages.length === 0 && <p className="m-4 rounded-xl border border-dashed border-[#dadce0] p-8 text-center text-sm text-[#5f6368] dark:border-[#3c4043] dark:text-[#bdc1c6]">No hay mensajes para mostrar.</p>}
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => loadDetail(message.id)}
                  className={`grid w-full grid-cols-[24px_minmax(0,1fr)_auto] gap-3 border-b border-[#e8eaed] px-4 py-3 text-left text-sm transition hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3)] dark:border-[#2b2f38] ${
                    selectedId === message.id
                      ? "bg-[#e8f0fe] dark:bg-[#172554]"
                      : message.read
                        ? "bg-white dark:bg-[#15171c]"
                        : "bg-[#f2f6fc] font-semibold dark:bg-[#1b2430]"
                  }`}
                >
                  <span className="pt-1 text-[#fbbc04]">☆</span>
                  <span className="min-w-0">
                    <span className="block truncate">{message.from.name || message.from.email}</span>
                    <span className="block truncate"><span>{message.subject || "Sin asunto"}</span>{message.excerpt ? <span className="font-normal text-[#5f6368] dark:text-[#bdc1c6]"> — {message.excerpt}</span> : null}</span>
                    <span className="mt-1 block text-xs font-normal text-[#5f6368] dark:text-[#bdc1c6]">{message.folder}{message.hasAttachments ? " · 📎 adjuntos" : ""}</span>
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium text-[#5f6368] dark:text-[#bdc1c6]">{formatShortDate(message.date)}</span>
                </button>
              ))}
            </section>

            <section className="overflow-y-auto bg-white dark:bg-[#15171c]">
              {loadingDetail && <p className="m-6 rounded-2xl bg-[#f8fafd] p-8 text-center text-sm text-[#5f6368] dark:bg-[#202124] dark:text-[#bdc1c6]">Cargando mensaje...</p>}
              {!loadingDetail && !detail && (
                <div className="flex h-full items-center justify-center p-8 text-center text-[#5f6368] dark:text-[#bdc1c6]">
                  <div>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f1f3f4] text-4xl dark:bg-[#202124]">📭</div>
                    <h2 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Selecciona un correo</h2>
                    <p className="mt-1 text-sm">Verás aquí el contenido, adjuntos y pedidos relacionados.</p>
                  </div>
                </div>
              )}
              {detail && (
                <article className="p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-normal">{detail.subject || selectedMessage?.subject || "Sin asunto"}</h2>
                      <p className="mt-2 text-sm text-[#5f6368] dark:text-[#bdc1c6]">{formatDate(detail.date)}</p>
                    </div>
                    <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-medium text-[#1967d2] dark:bg-[#172554] dark:text-[#bfdbfe]">{detail.internalStatus}</span>
                  </div>

                  <div className="rounded-2xl border border-[#e0e3eb] p-5 dark:border-[#2b2f38]">
                    <div className="mb-5 flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] font-semibold text-white">
                        {(detail.from.name || detail.from.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-sm">
                        <p className="font-semibold">{detail.from.name || detail.from.email}</p>
                        <p className="truncate text-[#5f6368] dark:text-[#bdc1c6]">{detail.from.email}</p>
                        <p className="mt-1 text-xs text-[#5f6368] dark:text-[#bdc1c6]">Para: {detail.recipients.join(", ") || "No disponible"}</p>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-6 text-[#202124] dark:text-[#e8eaed]">
                      {detail.textBody || detail.excerpt || "Sin cuerpo de texto disponible."}
                    </div>

                    {detail.bodyUrl && <a className="mt-5 inline-flex rounded-full border border-[#dadce0] px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#f8fafd] dark:border-[#3c4043] dark:hover:bg-[#202124]" href={detail.bodyUrl} target="_blank" rel="noreferrer">Abrir cuerpo completo firmado</a>}

                    {detail.attachments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 text-sm font-semibold">Adjuntos</h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {detail.attachments.map((attachment, index) => (
                            <a key={`${attachment.filename}-${index}`} href={attachment.fileUrl || "#"} target="_blank" rel="noreferrer" className="rounded-xl border border-[#dadce0] p-3 text-sm hover:bg-[#f8fafd] dark:border-[#3c4043] dark:hover:bg-[#202124]">
                              <span className="block truncate font-medium">📎 {attachment.filename || "Adjunto"}</span>
                              <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">{attachment.contentType || "archivo"}{attachment.sizeBytes ? ` · ${attachment.sizeBytes} bytes` : ""}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <section className="mt-5 rounded-2xl bg-[#f8fafd] p-5 dark:bg-[#202124]">
                    <h3 className="font-semibold">Cliente y pedidos</h3>
                    {related.length === 0 && <p className="mt-1 text-sm text-[#5f6368] dark:text-[#bdc1c6]">No hay pedidos relacionados para este remitente.</p>}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {related.map((order) => (
                        <Link key={order.id} href="/" className="rounded-xl bg-white p-3 text-sm shadow-sm hover:shadow dark:bg-[#15171c]">
                          <span className="font-semibold">Pedido #{order.numeroPedido || order.id}</span>
                          <br />{order.fechaPedido} · {order.estado} · {order.importe.toFixed(2)} €
                        </Link>
                      ))}
                    </div>
                  </section>
                </article>
              )}
            </section>
          </div>
        </section>
      </div>

      {composeOpen && (
        <section className="fixed bottom-4 right-4 z-30 w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#15171c]">
          <div className="flex items-center justify-between bg-[#f2f6fc] px-4 py-3 text-sm font-semibold dark:bg-[#202124]">
            Nuevo mensaje
            <button onClick={() => setComposeOpen(false)} className="rounded-full px-2 py-1 hover:bg-[#e8eaed] dark:hover:bg-[#2b2f38]">×</button>
          </div>
          <form onSubmit={send} className="space-y-0 p-4">
            <input name="to" aria-label="Para" placeholder="Para" className="w-full border-b border-[#e0e3eb] bg-transparent px-1 py-3 text-sm outline-none dark:border-[#2b2f38]" />
            <input name="cc" aria-label="CC" placeholder="CC" className="w-full border-b border-[#e0e3eb] bg-transparent px-1 py-3 text-sm outline-none dark:border-[#2b2f38]" />
            <input name="bcc" aria-label="CCO" placeholder="CCO" className="w-full border-b border-[#e0e3eb] bg-transparent px-1 py-3 text-sm outline-none dark:border-[#2b2f38]" />
            <input name="subject" aria-label="Asunto" placeholder="Asunto" className="w-full border-b border-[#e0e3eb] bg-transparent px-1 py-3 text-sm outline-none dark:border-[#2b2f38]" />
            <textarea name="text" aria-label="Cuerpo" rows={9} className="w-full resize-none bg-transparent px-1 py-3 text-sm outline-none" />
            <div className="flex items-center justify-between pt-3">
              <button disabled={sending} className="rounded-full bg-[#0b57d0] px-6 py-2 text-sm font-medium text-white hover:bg-[#0842a0] disabled:opacity-50">{sending ? "Enviando..." : "Enviar"}</button>
              <button type="button" onClick={() => setComposeOpen(false)} className="rounded-full px-4 py-2 text-sm hover:bg-[#e8eaed] dark:hover:bg-[#202124]">Descartar</button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
