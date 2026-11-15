import { type UiLang } from "./i18n/en";
import { type ArticleLang } from "./i18n/id";
export { type UiLang, type ArticleLang };

export type Card = {
  pageId: number;
  lang: ArticleLang;
  title: string;
  extract: string;
  thumbnail?: { src: string; width: number; height: number };
  url: string;
};

export const THEMES = ["terang", "gelap", "sepia", "kontras"] as const;
export type Theme = (typeof THEMES)[number];

/** Users can follow the system preference instead of pinning a theme. */
export type ThemeChoice = Theme | "system";

export const TEXT_SIZES = [0, 1, 2, 3, 4] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export type FontChoice = "serif" | "sans";

export const MEASURES = ["sempit", "normal", "lebar"] as const;
export type Measure = (typeof MEASURES)[number];

export const MOTION_PREFERENCES = ["system", "reduce", "full"] as const;
export type MotionPreference = (typeof MOTION_PREFERENCES)[number];

export const TOUCH_TARGETS = ["normal", "besar"] as const;
export type TouchTarget = (typeof TOUCH_TARGETS)[number];

export const SESSION_LENGTHS = [5, 10, 15, 20] as const;
export type SessionLength = (typeof SESSION_LENGTHS)[number];

export type Settings = {
  theme: ThemeChoice;
  textSize: TextSize;
  fontChoice: FontChoice;
  lineHeight: number;
  measure: Measure;
  lang: ArticleLang;
  imageOnly: boolean;
  sessionLength: SessionLength;
  haptics: boolean;
  openAllSections: boolean;
  showTocDesktop: boolean;
  resumePrompt: boolean;
  gestureHint: boolean;
  speechRate: number;
  motion: MotionPreference;
  touchTarget: TouchTarget;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  textSize: 1,
  fontChoice: "serif",
  lineHeight: 1.65,
  measure: "normal",
  lang: "en",
  imageOnly: false,
  sessionLength: 10,
  haptics: true,
  openAllSections: false,
  showTocDesktop: true,
  resumePrompt: true,
  gestureHint: true,
  speechRate: 1,
  motion: "system",
  touchTarget: "normal",
};

/** Reading sizes exposed by the display panel, in px values from the type scale. */
export const TEXT_SIZE_SCALE: readonly string[] = [
  "1rem",
  "1.125rem",
  "1.375rem",
  "1.75rem",
  "2.25rem",
];

export const LINE_HEIGHTS: readonly number[] = [1.5, 1.65, 1.8];

/** Reading column widths in `ch`, mapped to the tokens in DESIGN.md. */
export const MEASURE_CH: Record<Measure, number> = {
  sempit: 52,
  normal: 65,
  lebar: 78,
};

export type CollectionStatus = "want" | "read";

export type CollectionItem = {
  card: Card;
  savedAt: number;
  status: CollectionStatus;
};

/** Resume point for one article, stored per page id. */
export type ResumeEntry = {
  pageId: number;
  lang: ArticleLang;
  sectionId: string;
  sectionTitle: string;
  /** Relative position (0–1) inside the section, so text reflow keeps meaning. */
  offset: number;
  updatedAt: number;
};

/** A paragraph the reader marked. Text hashes guard against edited articles. */
export type Highlight = {
  pageId: number;
  lang: ArticleLang;
  sectionId: string;
  paragraphIndex: number;
  textHash: string;
  createdAt: number;
};
