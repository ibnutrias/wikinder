export type ArticleSection = {
  id: string;
  /** Heading depth mapped to a real HTML level: 2, 3 or 4. Never skips a level. */
  level: 2 | 3 | 4;
  title: string;
  paragraphs: string[];
};

export type ParsedArticle = {
  intro: string;
  sections: ArticleSection[];
  wordCount: number;
};

/**
 * Section headings that are navigation scaffolding rather than prose. Both
 * Indonesian and English Wikipedia use these, and the app serves four wikis.
 */
const NON_CONTENT_HEADINGS: readonly string[] = [
  "referensi",
  "rujukan",
  "catatan kaki",
  "pranala luar",
  "pranala jaba",
  "lihat pula",
  "lihat juga",
  "bacaan lanjutan",
  "bacaan lebih lanjut",
  "pustaka",
  "daftar pustaka",
  "sumber",
  "catatan",
  "galeri",
  "gallery",
  "references",
  "reference",
  "notes",
  "external links",
  "see also",
  "further reading",
  "bibliography",
  "sources",
  "citations",
  "footnotes",
];

const HEADING_PATTERN = /^(={2,6})\s*(.+?)\s*\1\s*$/;

/** Heading depth as written in wikitext, e.g. `==` → 2. */
export function headingLevel(line: string): number | null {
  const match = HEADING_PATTERN.exec(line.trim());
  return match ? match[1].length : null;
}

const EDIT_SUFFIX = /\s*\[\s*(?:sunting|edit)\s*\]\s*$/i;

export function headingText(line: string): string | null {
  const match = HEADING_PATTERN.exec(line.trim());
  if (!match) return null;
  return match[2].replace(EDIT_SUFFIX, "").trim();
}

export function isNonContentHeading(title: string): boolean {
  const normalised = title
    .trim()
    .toLowerCase()
    .replace(EDIT_SUFFIX, "")
    .replace(/\s+/g, " ");
  return NON_CONTENT_HEADINGS.includes(normalised);
}

const DIACRITICS = /[\u0300-\u036f]/g;

/** URL-safe, stable id with an accent-free base so anchors survive copy-paste. */
export function slugify(title: string, fallback = "bagian"): string {
  const slug = title
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

/** Splits a wiki section body into paragraphs, one per non-empty line block. */
export function toParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Maps a heading depth to h2/h3/h4 without ever skipping a level. */
export function nextHeadingLevel(previous: number, depth: number): 2 | 3 | 4 {
  const target = Math.min(4, Math.max(2, depth));
  const ceiling = previous === 0 ? 2 : Math.min(4, previous + 1);
  return Math.min(target, ceiling) as 2 | 3 | 4;
}

/**
 * Parses MediaWiki `explaintext` into a lead plus flat sections. Sections keep
 * an explicit level so the reader can render a correct heading outline.
 */
export function parseArticle(text: string): ParsedArticle {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const introLines: string[] = [];
  const sections: ArticleSection[] = [];
  const usedIds = new Map<string, number>();

  let current: ArticleSection | null = null;
  let currentLines: string[] = [];
  let skipping = false;
  let previousLevel = 0;

  const flush = (): void => {
    if (!current) return;
    const paragraphs = toParagraphs(currentLines.join("\n"));
    currentLines = [];
    if (paragraphs.length > 0) {
      sections.push({ ...current, paragraphs });
      previousLevel = current.level;
    }
    current = null;
  };

  for (const line of lines) {
    const depth = headingLevel(line);

    if (depth === null) {
      if (skipping) continue;
      if (current) currentLines.push(line);
      else introLines.push(line);
      continue;
    }

    const title = headingText(line) ?? "";
    if (!title) continue;
    skipping = isNonContentHeading(title);

    flush();
    if (skipping) continue;

    const base = slugify(title);
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    const id = seen === 0 ? base : `${base}-${seen + 1}`;

    current = {
      id,
      level: nextHeadingLevel(previousLevel, depth),
      title,
      paragraphs: [],
    };
  }

  flush();

  const introParagraphs = toParagraphs(introLines.join("\n"));
  const intro = introParagraphs.join("\n\n");
  const wordCount =
    countWords(intro) +
    sections.reduce(
      (total, section) =>
        total +
        countWords(section.title) +
        section.paragraphs.reduce((sum, paragraph) => sum + countWords(paragraph), 0),
      0,
    );

  return { intro, sections, wordCount };
}

/** Word count of any text, used for the reading-time estimate. */
export function wordCount(text: string): number {
  return countWords(text);
}

/** Reading time in minutes at 200 words per minute, never below one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}
