export type Lang = "id" | "en" | "jv" | "su";

export type Card = {
  pageId: number;
  lang: Lang;
  title: string;
  extract: string;
  thumbnail?: { src: string; width: number; height: number };
  url: string;
};

export type Theme = "kertas" | "malam" | "sepia" | "kontras";

export type TextSize = 0 | 1 | 2 | 3 | 4;

export type FontChoice = "serif" | "sans";

export type Settings = {
  theme: Theme;
  textSize: TextSize;
  fontChoice: FontChoice;
  lineHeight: number;
  lang: Lang;
  imageOnly: boolean;
};

export type CollectionStatus = "want" | "read";

export type CollectionItem = {
  card: Card;
  savedAt: number;
  status: CollectionStatus;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "kertas",
  textSize: 2,
  fontChoice: "serif",
  lineHeight: 1.6,
  lang: "id",
  imageOnly: false,
};

/** Text sizes exposed by the Reader display panel, as CSS custom property values. */
export const TEXT_SIZE_SCALE: readonly string[] = [
  "0.9375rem",
  "1rem",
  "1.125rem",
  "1.25rem",
  "1.375rem",
];
