import { apiError, apiJson, fetchWikipedia } from "@/lib/api";
import { normalizeCards, parseLang, searchPath, sortCardsByIndex } from "@/lib/wikipedia";

const MAX_QUERY_LENGTH = 120;

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const lang = parseLang(url.searchParams.get("lang"));
  if (!lang) return apiError("invalid_lang");

  const query = (url.searchParams.get("q") ?? "").trim();
  if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    return apiError("invalid_query");
  }

  const result = await fetchWikipedia(lang, searchPath(lang, query));
  if (!result.ok) return apiError(result.code);

  const cards = sortCardsByIndex(normalizeCards(result.data, lang), result.data);

  return apiJson({ lang, query, cards }, "public, max-age=60, s-maxage=300");
}
