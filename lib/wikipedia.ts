export type Lang = "id" | "en" | "jv" | "su";

export const ALLOWED_LANGS: Lang[] = ["id", "en", "jv", "su"];

export const WIKI_HOST: Record<Lang, string> = {
  id: "id.wikipedia.org",
  en: "en.wikipedia.org",
  jv: "jv.wikipedia.org",
  su: "su.wikipedia.org",
};

export const CARD_API_BASE: Record<Lang, string> = {
  id: "https://id.wikipedia.org/w/api.php",
  en: "https://en.wikipedia.org/w/api.php",
  jv: "https://jv.wikipedia.org/w/api.php",
  su: "https://su.wikipedia.org/w/api.php",
};

export const LANG_LABEL: Record<Lang, string> = {
  id: "Indonesia",
  en: "Inggris",
  jv: "Jawa",
  su: "Sunda",
};

export type Card = {
  pageId: number;
  lang: Lang;
  title: string;
  extract: string;
  thumbnail?: { src: string; width: number; height: number };
  url: string;
};

export type MediaWikiRawCard = {
  pageid: number;
  title: string;
  index: number;
  thumbnail?: { source: string; width: number; height: number };
  extract?: string;
  original?: { source: string; width: number; height: number };
  pageprops?: {disambiguation?: string | null};
  normalizedtitle?: string;
};

type RawPageBatch = {
  query?: {
    pages?: MediaWikiRawCard[];
  };
};

export function parseLang(raw: string): Lang | null {
  if (ALLOWED_LANGS.includes(raw as Lang)) return raw as Lang;
  return null;
}

export function normalizeCard(raw: MediaWikiRawCard, lang: Lang): Card | null {
  const title = raw.title;
  if (!title || title.trim().length === 0) return null;

  if (raw.pageprops?.disambiguation) {
    return null;
  }

  const extractRaw = raw.extract != null ? raw.extract : "";
  const extractText =
    typeof extractRaw === "string" ? stripExtract(extractRaw) : "";

  if (extractText.length < 80) {
    return null;
  }

  const image = pickImage(raw.thumbnail, raw.original);

  const pageId = raw.pageid;
  if (typeof pageId !== "number" || !Number.isFinite(pageId)) return null;

  return {
    pageId,
    lang,
    title: title.trim(),
    extract: extractText,
    thumbnail: image,
    url: makeArticleUrl(lang, title),
  };
}

function stripExtract(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  return text;
}

function pickImage(
  thumb?: MediaWikiRawCard["thumbnail"],
  original?: MediaWikiRawCard["original"]
): Card["thumbnail"] | undefined {
  const source =
    thumb?.source ?? original?.source;
  if (!source) return undefined;

  if (!/^https?:\/\//i.test(source)) return undefined;

  const width =
    typeof thumb?.width === "number" && thumb.width > 0
      ? thumb.width
      : typeof original?.width === "number" && original.width > 0
        ? original.width
        : 800;

  const height =
    typeof thumb?.height === "number" && thumb.height > 0
      ? thumb.height
      : typeof original?.height === "number" && original.height > 0
        ? original.height
        : 800;

  return { src: source, width, height };
}

function makeArticleUrl(lang: Lang, title: string): string {
  const host = WIKI_HOST[lang] ?? "wikipedia.org";
  const encoded = encodeURIComponent(title);
  return `https://${host}/wiki/${encoded}`;
}

export function sortRawCards(raw: MediaWikiRawCard[]): MediaWikiRawCard[] {
  const copy = [...raw];
  copy.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return copy;
}

export function makeRandomQuery(lang: Lang): URLSearchParams {
  const params = new URLSearchParams();
  params.set("action", "query");
  params.set("format", "json");
  params.set("formatversion", "2");
  params.set("origin", "*");
  params.set("generator", "random");
  params.set("grnnamespace", "0");
  params.set("grnlimit", "10");
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

export function makeArticleQuery(pageId: number, lang: Lang): URLSearchParams {
  const params = new URLSearchParams();
  params.set("action", "query");
  params.set("format", "json");
  params.set("formatversion", "2");
  params.set("origin", "*");
  params.set("pageids", String(pageId));
  params.set("prop", "extracts|pageimages|info");
  params.set("explaintext", "1");
  params.set("exsectionformat", "wiki");
  params.set("inprop", "url");
  return params;
}

export function makeSearchQuery(query: string, lang: Lang): URLSearchParams {
  const params = new URLSearchParams();
  params.set("action", "query");
  params.set("format", "json");
  params.set("formatversion", "2");
  params.set("origin", "*");
  params.set("generator", "search");
  params.set("gsrsearch", query);
  params.set("gsrlimit", "10");
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
