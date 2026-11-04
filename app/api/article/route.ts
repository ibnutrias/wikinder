import { apiError, apiJson, fetchWikipedia, parsePageId } from "@/lib/api";
import { articlePath, normalizeArticle, parseLang } from "@/lib/wikipedia";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const lang = parseLang(url.searchParams.get("lang"));
  if (!lang) return apiError("invalid_lang");

  const pageId = parsePageId(url.searchParams.get("pageId"));
  if (pageId === null) return apiError("invalid_page_id");

  const result = await fetchWikipedia(lang, articlePath(lang, pageId));
  if (!result.ok) return apiError(result.code);

  const article = normalizeArticle(result.data, lang);
  if (!article) return apiError("not_found");

  return apiJson({ article }, "public, max-age=3600, s-maxage=86400");
}
