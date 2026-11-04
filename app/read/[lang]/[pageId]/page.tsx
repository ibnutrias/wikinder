import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderView } from "@/components/reader/reader-view";
import { fetchWikipedia } from "@/lib/api";
import { parseArticle } from "@/lib/article";
import { COPY } from "@/lib/copy";
import { articlePath, normalizeArticle, parseLang } from "@/lib/wikipedia";

const REVALIDATE_SECONDS = 3600;

type ReaderPageProps = { params: Promise<{ lang: string; pageId: string }> };

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

async function loadArticle(rawLang: string, rawId: string) {
  const lang = parseLang(rawLang);
  const pageId = parseId(rawId);
  if (!lang || pageId === null) return null;

  const result = await fetchWikipedia(lang, articlePath(lang, pageId), {
    revalidate: REVALIDATE_SECONDS,
  });
  if (!result.ok) throw new Error(`wiki_upstream_${result.code}`);

  const article = normalizeArticle(result.data, lang);
  if (!article) return null;
  return { article, parsed: parseArticle(article.extract) };
}

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { lang, pageId } = await params;
  const loaded = await loadArticle(lang, pageId).catch(() => null);
  if (!loaded) return { title: COPY.error.tidakDitemukanJudul };

  const description = loaded.article.extract.replace(/\s+/g, " ").slice(0, 155);
  return {
    title: loaded.article.title,
    description,
    openGraph: { title: loaded.article.title, description, type: "article" },
  };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { lang, pageId } = await params;
  const loaded = await loadArticle(lang, pageId);
  if (!loaded) notFound();

  return <ReaderView article={loaded.article} parsed={loaded.parsed} />;
}
