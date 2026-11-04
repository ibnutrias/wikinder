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

export type Lang = "id" | "en" | "jv" | "su";

export const DEFAULT_SETTINGS: Settings = {
  theme: "kertas",
  textSize: 2,
  fontChoice: "serif",
  lineHeight: 1.6,
  lang: "id",
  imageOnly: false,
};

export type CollectionItem = {
  card: CardSummary;
  savedAt: number;
  status: "want" | "read";
};

export type CardSummary = {
  pageId: number;
  lang: Lang;
  title: string;
  extract: string;
  thumbnail?: { src: string; width: number; height: number };
  url: string;
};

export const LANG_LABEL: Record<Lang, string> = {
  id: "Indonesia",
  en: "Inggris",
  jv: "Jawa",
  su: "Sunda",
};

export const COPY = {
  wordmark: "Wikinder",
  nav: {
    jelajah: "Jelajah",
    koleksi: "Koleksi",
    cari: "Cari",
    pengaturan: "Pengaturan",
  },
  deck: {
    selamatDatang:
      "Selamat datang di Wikinder. Artikelyang menarik menunggumu di antrean.",
    bahasa: "Bahasa",
    bacaRingkasan: "Baca ringkasan",
    bagikan: "Bagikan",
  },
} as const;

export type Copy = typeof COPY;
