export type CitationInput = {
  title: string;
  pageId: number;
  langCode: string;
  langLabel: string;
  host: string;
  accessedAt: Date;
};

const DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatAccessDate(date: Date): string {
  return DATE.format(date);
}

/** Deep link that never changes even if the article is renamed. */
export function permanentUrl(input: Pick<CitationInput, "host" | "pageId">): string {
  return `https://${input.host}/w/index.php?curid=${input.pageId}`;
}

export function formatPlainCitation(input: CitationInput): string {
  const date = formatAccessDate(input.accessedAt);
  return `${input.title}. Wikipedia bahasa ${input.langLabel} (${input.langCode}). Diakses ${date}. ${permanentUrl(input)}. Lisensi CC BY-SA 4.0.`;
}

export function formatApaCitation(input: CitationInput): string {
  const date = formatAccessDate(input.accessedAt);
  return `${input.title}. (${input.accessedAt.getFullYear()}). Wikipedia bahasa ${input.langLabel}. Diakses ${date}, dari ${permanentUrl(input)}`;
}
