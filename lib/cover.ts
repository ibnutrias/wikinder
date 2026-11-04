import { fnv1a } from "./hash";
import type { Theme } from "./types";

export type CoverPalette = {
  background: string;
  foreground: string;
  accent: string;
};

/**
 * Deterministic typographic covers for articles without a photograph. Colours
 * come from each theme's own ink and paper, never random hues, so a cover
 * always belongs to the surrounding page.
 */
const COVERS: Record<Theme, readonly CoverPalette[]> = {
  terang: [
    { background: "#E9ECF1", foreground: "#14161A", accent: "#2536D8" },
    { background: "#2536D8", foreground: "#FFFFFF", accent: "#E9ECF1" },
    { background: "#14161A", foreground: "#FFFFFF", accent: "#9AA6FF" },
    { background: "#FFFFFF", foreground: "#14161A", accent: "#2536D8" },
  ],
  gelap: [
    { background: "#21252E", foreground: "#E8EAEE", accent: "#9AA6FF" },
    { background: "#9AA6FF", foreground: "#0B1030", accent: "#21252E" },
    { background: "#E8EAEE", foreground: "#0F1115", accent: "#2536D8" },
    { background: "#171A20", foreground: "#E8EAEE", accent: "#9AA6FF" },
  ],
  sepia: [
    { background: "#E4D5B4", foreground: "#3A2E1F", accent: "#7A2E1B" },
    { background: "#7A2E1B", foreground: "#FBEBD2", accent: "#E4D5B4" },
    { background: "#3A2E1F", foreground: "#F1E6CF", accent: "#C9B58A" },
    { background: "#F8F0DE", foreground: "#3A2E1F", accent: "#7A2E1B" },
  ],
  kontras: [
    { background: "#FFFFFF", foreground: "#000000", accent: "#0A2540" },
    { background: "#000000", foreground: "#FFFFFF", accent: "#E0E0E0" },
    { background: "#0A2540", foreground: "#FFFFFF", accent: "#C9D6E8" },
    { background: "#F2F2F2", foreground: "#000000", accent: "#0A2540" },
  ],
};

export function hashTitle(title: string): number {
  return fnv1a(title);
}

export function coverFor(title: string, theme: Theme): CoverPalette {
  const palettes = COVERS[theme] ?? COVERS.terang;
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
