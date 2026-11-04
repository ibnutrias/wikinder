import type { Theme } from "./types";

export type CoverPalette = {
  background: string;
  foreground: string;
  accent: string;
};

/**
 * Deterministic typographic covers for articles without a photograph. Colours
 * are drawn from each theme's own ink and paper, never random hues, so a cover
 * always belongs to the surrounding page.
 */
const COVERS: Record<Theme, readonly CoverPalette[]> = {
  kertas: [
    { background: "#E6DFD0", foreground: "#1F1B16", accent: "#8E2A1F" },
    { background: "#8E2A1F", foreground: "#FFF8F0", accent: "#F3EEE4" },
    { background: "#1F1B16", foreground: "#FBF8F2", accent: "#E6DFD0" },
    { background: "#F3EEE4", foreground: "#1F1B16", accent: "#8E2A1F" },
  ],
  malam: [
    { background: "#28241E", foreground: "#EFE8DA", accent: "#E58F7A" },
    { background: "#E58F7A", foreground: "#2A0E08", accent: "#EFE8DA" },
    { background: "#EFE8DA", foreground: "#14120F", accent: "#8E2A1F" },
    { background: "#1C1915", foreground: "#EFE8DA", accent: "#E58F7A" },
  ],
  sepia: [
    { background: "#DCC793", foreground: "#3B2F20", accent: "#7A2E1B" },
    { background: "#7A2E1B", foreground: "#FBE9C8", accent: "#E9D9B6" },
    { background: "#3B2F20", foreground: "#F1E4C8", accent: "#DCC793" },
    { background: "#E9D9B6", foreground: "#3B2F20", accent: "#7A2E1B" },
  ],
  kontras: [
    { background: "#FFFFFF", foreground: "#000000", accent: "#0A2540" },
    { background: "#000000", foreground: "#FFFFFF", accent: "#E3E3E3" },
    { background: "#0A2540", foreground: "#FFFFFF", accent: "#C9D6E8" },
    { background: "#F2F2F2", foreground: "#000000", accent: "#0A2540" },
  ],
};

/** Stable 32-bit FNV-1a hash: same title always yields the same cover. */
export function hashTitle(title: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < title.length; index += 1) {
    hash ^= title.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function coverFor(title: string, theme: Theme): CoverPalette {
  const palettes = COVERS[theme] ?? COVERS.kertas;
  return palettes[hashTitle(title) % palettes.length];
}

/**
 * One or two letters for the cover: initials of the first two words, or the
 * first two characters when the title is a single word.
 */
export function coverMonogram(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) {
    return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  }
  return `${Array.from(words[0])[0]}${Array.from(words[1])[0]}`.toUpperCase();
}

/** Library-style shelf number, e.g. `No. 0042`. */
export function editionNumber(pageId: number): string {
  return `No. ${String(pageId % 10000).padStart(4, "0")}`;
}
