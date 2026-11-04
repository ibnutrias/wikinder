import { apiUrl } from "./wikipedia";

export const UPSTREAM_TIMEOUT_MS = 8000;

export type ApiErrorCode =
  | "invalid_lang"
  | "invalid_page_id"
  | "invalid_query"
  | "upstream_error"
  | "upstream_timeout"
  | "upstream_shape"
  | "not_found";

const ERROR_STATUS: Record<ApiErrorCode, number> = {
  invalid_lang: 400,
  invalid_page_id: 400,
  invalid_query: 400,
  upstream_error: 502,
  upstream_timeout: 504,
  upstream_shape: 502,
  not_found: 404,
};

const ERROR_MESSAGE: Record<ApiErrorCode, string> = {
  invalid_lang: "Bahasa tidak didukung. Pilih id, en, jv, atau su.",
  invalid_page_id: "Nomor halaman tidak valid.",
  invalid_query: "Kata kunci pencarian tidak valid.",
  upstream_error: "Wikipedia sedang tidak dapat dihubungi.",
  upstream_timeout: "Wikipedia menjawab terlalu lama.",
  upstream_shape: "Wikipedia mengirim data yang tidak dikenali.",
  not_found: "Artikel tidak ditemukan.",
};

export function apiError(code: ApiErrorCode): Response {
  return Response.json(
    { error: { code, message: ERROR_MESSAGE[code] } },
    {
      status: ERROR_STATUS[code],
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function parsePageId(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export function apiJson(
  body: unknown,
  cacheControl: string,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cacheControl },
  });
}

function userAgent(): string {
  const contact = process.env.WIKINDER_CONTACT?.trim() || "https://wikinder.app";
  return `Wikinder/0.1 (+${contact})`;
}

export type UpstreamResult =
  | { ok: true; data: unknown }
  | { ok: false; code: ApiErrorCode };

/**
 * Calls the MediaWiki Action API. The language is already allowlisted by the
 * caller, so only a known host can ever be reached.
 */
export async function fetchWikipedia(
  lang: Parameters<typeof apiUrl>[0],
  path: string,
  options: { revalidate?: number } = {},
): Promise<UpstreamResult> {
  let response: Response;
  try {
    response = await fetch(apiUrl(lang, path), {
      headers: {
        "User-Agent": userAgent(),
        Accept: "application/json",
      },
      ...(options.revalidate === undefined
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: options.revalidate } }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, code: "upstream_timeout" };
    }
    return { ok: false, code: "upstream_error" };
  }

  if (!response.ok) {
    return { ok: false, code: "upstream_error" };
  }

  try {
    const data: unknown = await response.json();
    return { ok: true, data };
  } catch {
    return { ok: false, code: "upstream_shape" };
  }
}
