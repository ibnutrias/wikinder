import type { Card, ArticleLang } from "./types";

export type ApiErrorBody = { error: { code: string; message: string } };

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.message === "string"
  );
}

async function getJSON(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(path, {
    signal: signal ?? AbortSignal.timeout(12000),
    headers: { Accept: "application/json" },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isErrorBody(payload)) {
      throw new ApiRequestError(payload.error.code, payload.error.message, response.status);
    }
    throw new ApiRequestError("http_error", "Permintaan gagal.", response.status);
  }

  return payload;
}

function readCards(payload: unknown): Card[] {
  if (typeof payload !== "object" || payload === null) return [];
  const cards = (payload as { cards?: unknown }).cards;
  return Array.isArray(cards) ? (cards as Card[]) : [];
}

export async function requestCards(lang: ArticleLang, signal?: AbortSignal): Promise<Card[]> {
  const payload = await getJSON(`/api/cards?lang=${lang}`, signal);
  return readCards(payload);
}

export async function requestSearch(
  lang: ArticleLang,
  query: string,
  signal?: AbortSignal,
): Promise<Card[]> {
  const params = new URLSearchParams({ lang, q: query });
  const payload = await getJSON(`/api/search?${params.toString()}`, signal);
  return readCards(payload);
}
