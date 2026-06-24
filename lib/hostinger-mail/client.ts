import "server-only";

import {
  HostingerMailConfigError,
  HostingerMailError,
  messageForStatus,
} from "./errors.ts";

export type RequestOptions = {
  method?: string;
  body?: unknown;
  timeoutMs?: number;
  retry?: boolean;
  fetchImpl?: typeof fetch;
};

function env() {
  const baseUrl =
    process.env.HOSTINGER_MAIL_API_BASE_URL ?? "https://api.mail.hostinger.com";
  const token = process.env.HOSTINGER_MAIL_API_TOKEN;

  if (!token) {
    throw new HostingerMailConfigError();
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function redactHeaders(headers: HeadersInit) {
  const redacted = new Headers(headers);

  if (redacted.has("authorization")) {
    redacted.set("authorization", "Bearer [REDACTED]");
  }

  return redacted;
}

export async function hostingerMailRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { baseUrl, token } = env();
  const method = options.method ?? "GET";
  const safeRetry = options.retry ?? method === "GET";
  const tries = safeRetry ? 2 : 1;
  let last: unknown;

  for (let attempt = 0; attempt < tries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);

    try {
      const res = await (options.fetchImpl ?? fetch)(`${baseUrl}${path}`, {
        method,
        cache: "no-store",
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

      clearTimeout(timer);

      if (res.ok) {
        return (await safeJson(res)) as T;
      }

      const data = (await safeJson(res)) as {
        correlation_id?: string;
        error?: string;
      } | null;

      throw new HostingerMailError(
        messageForStatus(res.status),
        res.status,
        "HOSTINGER_MAIL_HTTP",
        data?.correlation_id,
      );
    } catch (error) {
      clearTimeout(timer);
      last = error;

      if (
        error instanceof HostingerMailError &&
        error.status < 500 &&
        error.status !== 429
      ) {
        break;
      }

      if ((error as Error).name === "AbortError") {
        throw new HostingerMailError(
          "La petición a Hostinger Mail ha agotado el tiempo de espera.",
          504,
          "HOSTINGER_MAIL_TIMEOUT",
        );
      }
    }
  }

  throw last;
}

export const verifiedHostingerEndpoints: string[] = [];
