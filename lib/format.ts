const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "4 November 2026" — deterministic for a given timestamp and locale. */
export function formatSavedDate(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "";
  return DATE_FORMATTER.format(new Date(timestamp));
}

export function formatShortDate(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "";
  return SHORT_DATE_FORMATTER.format(new Date(timestamp));
}

export function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
