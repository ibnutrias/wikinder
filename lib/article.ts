export type ArticleSubsection = {
  title: string;
  body: string;
};

export type ArticleSection = {
  title: string;
  body: string;
  subsections: ArticleSubsection[];
};

export type ParsedArticle = {
  intro: string;
  sections: ArticleSection[];
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

export function isNonContentHeading(title: string): boolean {
  const normalised = title
    .trim()
    .toLowerCase()
    .replace(/\[\s*(?:sunting|edit)\s*\]$/i, "")
    .replace(/\s+/g, " ");
  return NON_CONTENT_HEADINGS.includes(normalised);
}

const HEADING_PATTERN = /^(={2,6})\s*(.+?)\s*\1\s*$/;

export function headingLevel(line: string): number | null {
  const match = HEADING_PATTERN.exec(line.trim());
  if (!match) return null;
  return match[1].length;
}

export function headingText(line: string): string | null {
  const match = HEADING_PATTERN.exec(line.trim());
  if (!match) return null;
  return match[2].replace(/\[\s*(?:sunting|edit)\s*\]$/i, "").trim();
}

function cleanBody(lines: string[]): string {
  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

/**
 * Parses MediaWiki `explaintext` output into a lead paragraph plus sections.
 * Level 2 headings start a section, deeper headings nest inside it. Sections
 * whose heading is pure navigation (references, external links, …) are
 * dropped entirely.
 */
export function parseArticle(text: string): ParsedArticle {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const introLines: string[] = [];
  const sections: ArticleSection[] = [];

  let current: ArticleSection | null = null;
  let currentSectionBody: string[] = [];
  let subsection: ArticleSubsection | null = null;
  let subsectionBody: string[] = [];
  // True while inside a navigation block (references, external links, …)
  // whose body must not leak into the following prose.
  let skipping = false;

  const flushSubsection = (): void => {
    if (!subsection) return;
    subsection.body = cleanBody(subsectionBody);
    subsectionBody = [];
    if (subsection.body) current?.subsections.push(subsection);
    subsection = null;
  };

  const flushSection = (): void => {
    flushSubsection();
    if (!current) return;
    current.body = cleanBody(currentSectionBody);
    currentSectionBody = [];
    if (current.body || current.subsections.length > 0) sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const level = headingLevel(line);
    if (level === null) {
      if (skipping) continue;
      if (current) {
        if (subsection) subsectionBody.push(line);
        else currentSectionBody.push(line);
      } else {
        introLines.push(line);
      }
      continue;
    }

    const title = headingText(line) ?? "";
    if (!title) continue;
    skipping = isNonContentHeading(title);

    if (level <= 2) {
      flushSection();
      if (skipping) continue;
      current = { title, body: "", subsections: [] };
      continue;
    }

    flushSubsection();
    if (skipping) continue;

    if (!current) {
      // A deep heading before any level-2 heading: treat it as a section so
      // the content is never silently dropped.
      current = { title, body: "", subsections: [] };
      continue;
    }

    subsection = { title, body: "" };
  }

  flushSection();

  return { intro: cleanBody(introLines), sections };
}

/** Rough reading time in minutes, based on 200 words per minute. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
