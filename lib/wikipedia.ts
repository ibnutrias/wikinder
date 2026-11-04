import type { Card, Lang } from "./types";

export const ALLOWED_LANGS = ["id", "en", "jv", "su"] as const;

export const LANG_LABEL: Record<Lang, string> = {
  id: "Indonesia",
  en: "Inggris",
  jv: "Jawa",
  su: "Sunda",
};

const WIKI_HOST: Record<Lang, string> = {
  id: "id.wikipedia.org",
  en: "en.wikipedia.org",
  jv: "jv.wikipedia.org",
  su: "su.wikipedia.org",
};

/** Shortest extract that still reads like a summary rather than a stub. */
export const MIN_EXTRACT_LENGTH = 80;

/** Number of random articles requested per batch. */
export const BATCH_SIZE = 10;

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (ALLOWED_LANGS as readonly string[]).includes(value);
}

export function parseLang(value: unknown): Lang | null {
  return isLang(value) ? value : null;
}

export function wikiHost(lang: Lang): string {
  return WIKI_HOST[lang];
}

export function articleUrl(lang: Lang, title: string): string {
  return `https://${wikiHost(lang)}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

function baseParams(): URLSearchParams {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
  });
  return params;
}

function cardProps(params: URLSearchParams): URLSearchParams {
  params.set("prop", "extracts|pageimages|pageprops|info");
  params.set("exintro", "1");
  params.set("explaintext", "1");
  params.set("exsentences", "4");
  params.set("exlimit", "max");
  params.set("piprop", "thumbnail");
  params.set("pithumbsize", "800");
  params.set("pilimit", "max");
  params.set("ppprop", "disambiguation");
  params.set("inprop", "url");
  return params;
}

export function randomCardsPath(): string {
  const params = cardProps(baseParams());
  params.set("generator", "random");
  params.set("grnnamespace", "0");
  params.set("grnlimit", String(BATCH_SIZE));
  return `/w/api.php?${params.toString()}`;
}

export function searchPath(lang: Lang, query: string): string {
  const params = cardProps(baseParams());
  params.set("generator", "search");
  params.set("gsrsearch", query);
  params.set("gsrlimit", String(BATCH_SIZE));
  params.set("gsrnamespace", "0");
  return `/w/api.php?${params.toString()}`;
}

export function articlePath(lang: Lang, pageId: number): string {
  const params = baseParams();
  params.set("pageids", String(pageId));
  params.set("prop", "extracts|pageimages|info");
  params.set("explaintext", "1");
  params.set("exsectionformat", "wiki");
  params.set("piprop", "thumbnail|name");
  params.set("pithumbsize", "1200");
  params.set("inprop", "url");
  return `/w/api.php?${params.toString()}`;
}

export function apiUrl(lang: Lang, path: string): string {
  return `https://${wikiHost(lang)}${path}`;
}

/* -------------------------------------------------------------------------- */
/* Manual type guards                                                          */
/* -------------------------------------------------------------------------- */

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readThumbnail(
  value: unknown,
): { src: string; width: number; height: number } | null {
  if (!isRecord(value)) return null;
  const source = readString(value.source);
  if (!source || !/^https:\/\//i.test(source)) return null;
  const width = readNumber(value.width);
  const height = readNumber(value.height);
  if (width === null || height === null || width <= 0 || height <= 0) return null;
  return { src: source, width: Math.round(width), height: Math.round(height) };
}

function tidyExtract(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Normalisers                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Postel's law: accept whatever upstream sends, return only the strict shape.
 * Returns null for anything that would make a poor card (stubs, disambiguation
 * pages, missing titles).
 */
export function normalizeCard(input: unknown, lang: Lang): Card | null {
  if (!isRecord(input)) return null;

  const pageId = readNumber(input.pageid);
  if (pageId === null || pageId <= 0) return null;

  const title = readString(input.title)?.trim();
  if (!title) return null;

  const pageprops = isRecord(input.pageprops) ? input.pageprops : null;
  if (pageprops && pageprops.disambiguation !== undefined) return null;

  const rawExtract = readString(input.extract);
  if (rawExtract === null) return null;
  const extract = tidyExtract(rawExtract);
  if (extract.length < MIN_EXTRACT_LENGTH) return null;

  const thumbnail =
    readThumbnail(input.thumbnail) ??
    readThumbnail(input.original) ??
    undefined;

  return {
    pageId: Math.round(pageId),
    lang,
    title,
    extract,
    ...(thumbnail ? { thumbnail } : {}),
    url: articleUrl(lang, title),
  };
}

function readPages(payload: unknown): unknown[] {
  if (!isRecord(payload)) return [];
  const query = payload.query;
  if (!isRecord(query)) return [];
  const pages = query.pages;
  if (Array.isArray(pages)) return pages;
  // Older formatversion=1 responses key pages by page id.
  if (isRecord(pages)) return Object.values(pages);
  return [];
}

export function normalizeCards(payload: unknown, lang: Lang): Card[] {
  const cards: Card[] = [];
  for (const page of readPages(payload)) {
    const card = normalizeCard(page, lang);
    if (card) cards.push(card);
  }
  return cards;
}

/** `generator` results are not ordered; `index` restores the random order. */
export function sortCardsByIndex(cards: Card[], payload: unknown): Card[] {
  const order = new Map<number, number>();
  for (const page of readPages(payload)) {
    if (!isRecord(page)) continue;
    const pageId = readNumber(page.pageid);
    const index = readNumber(page.index);
    if (pageId === null || index === null) continue;
    order.set(Math.round(pageId), index);
  }
  return [...cards].sort(
    (a, b) => (order.get(a.pageId) ?? 0) - (order.get(b.pageId) ?? 0),
  );
}

export type FullArticle = {
  lang: Lang;
  pageId: number;
  title: string;
  extract: string;
  /** Byte length reported by the API, useful before parsing. */
  length: number;
  /** ISO timestamp of the last revision, when the API reports it. */
  touched: string | null;
  thumbnail?: { src: string; width: number; height: number };
  url: string;
};

/**
 * Reader normaliser: unlike `normalizeCard` it accepts short articles and does
 * not filter disambiguation pages (the reader shows whatever was requested).
 */
export function normalizeArticle(payload: unknown, lang: Lang): FullArticle | null {
  for (const page of readPages(payload)) {
    if (!isRecord(page)) continue;
    if (page.missing !== undefined) return null;

    const pageId = readNumber(page.pageid);
    const title = readString(page.title)?.trim();
    const extract = readString(page.extract);
    if (pageId === null || pageId <= 0 || !title || extract === null) return null;

    const length = readNumber(page.length);
    const touched = readString(page.touched);
    const thumbnail = readThumbnail(page.thumbnail);

    return {
      lang,
      pageId: Math.round(pageId),
      title,
      extract: tidyExtract(extract),
      length: length !== null && length > 0 ? Math.round(length) : 0,
      touched,
      ...(thumbnail ? { thumbnail } : {}),
      url: articleUrl(lang, title),
    };
  }
  return null;
}
