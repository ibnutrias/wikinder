import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/lib/contrast";
import { coverFor, coverMonogram, hashTitle } from "@/lib/cover";
import type { Theme } from "@/lib/types";

const THEMES: Theme[] = ["terang", "gelap", "sepia", "kontras"];

describe("cover palette", () => {
  it("is deterministic for a given title and theme", () => {
    const first = coverFor("Batik", "terang");
    const second = coverFor("Batik", "terang");
    expect(first).toEqual(second);
  });

  it("spreads titles across the palette", () => {
    const titles = ["Batik", "Gamelan", "Kopi", "Wayang", "Candi", "Rempah"];
    const backgrounds = new Set(titles.map((title) => coverFor(title, "terang").background));
    expect(backgrounds.size).toBeGreaterThan(1);
  });

  it("keeps monogram text readable on every theme", () => {
    for (const theme of THEMES) {
      for (const title of ["Batik", "Gamelan", "Kopi", "Wayang", "Candi", "Rempah", "A"]) {
        const cover = coverFor(title, theme);
        const ratio = contrastRatio(cover.foreground, cover.background);
        expect(ratio, `${title} on ${theme}`).not.toBeNull();
        expect(ratio ?? 0).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps the accent rule visible", () => {
    for (const theme of THEMES) {
      for (const title of ["Batik", "Gamelan", "Kopi", "Wayang"]) {
        const cover = coverFor(title, theme);
        expect(contrastRatio(cover.accent, cover.background) ?? 0).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("cover helpers", () => {
  it("hashes stably", () => {
    expect(hashTitle("Batik")).toBe(hashTitle("Batik"));
    expect(hashTitle("Batik")).not.toBe(hashTitle("Gamelan"));
  });

  it("takes initials from the first two words", () => {
    expect(coverMonogram("Kopi Luwak")).toBe("KL");
    expect(coverMonogram("Gunung Merapi")).toBe("GM");
  });

  it("falls back to two characters for one-word titles", () => {
    expect(coverMonogram("Wayang")).toBe("WA");
  });

  it("ignores punctuation and never returns an empty monogram", () => {
    expect(coverMonogram("  ")).toBe("?");
    expect(coverMonogram("—").length).toBeGreaterThan(0);
  });
});
