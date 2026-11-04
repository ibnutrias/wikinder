import { apiError, apiJson, fetchWikipedia } from "@/lib/api";
import {
  normalizeCards,
  parseLang,
  randomCardsPath,
  sortCardsByIndex,
} from "@/lib/wikipedia";

/** Random articles change on every call, so nothing may be cached. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const lang = parseLang(url.searchParams.get("lang"));
  if (!lang) return apiError("invalid_lang");

  const result = await fetchWikipedia(lang, randomCardsPath());
  if (!result.ok) return apiError(result.code);

  const cards = sortCardsByIndex(normalizeCards(result.data, lang), result.data);

  return apiJson({ lang, cards }, "no-store");
}
