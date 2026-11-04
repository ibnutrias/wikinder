import { describe, expect, it } from "vitest";

import {
  headingLevel,
  headingText,
  isNonContentHeading,
  nextHeadingLevel,
  parseArticle,
  readingMinutes,
  slugify,
  toParagraphs,
  wordCount,
} from "@/lib/article";

const SAMPLE = `Batik adalah kain bergambar.

Batik diakui sebagai warisan budaya.

== Sejarah ==
Batik sudah ada sejak lama.
Motifnya berkembang dari masa ke masa.

=== Masa modern ===
Batik modern mulai dipamerkan.

==== Detail ====
Detail yang lebih dalam.

== Referensi ==
Daftar pustaka yang tidak perlu dibaca.

== Budaya ==
Batik menjadi identitas.`;

describe("heading parsing", () => {
  it("detects depth and text", () => {
    expect(headingLevel("== Sejarah ==")).toBe(2);
    expect(headingLevel("=== Masa modern ===")).toBe(3);
    expect(headingLevel("Bukan heading")).toBeNull();
    expect(headingText("== Sejarah [sunting] ==")).toBe("Sejarah");
  });

  it("recognises navigation sections in both languages", () => {
    expect(isNonContentHeading("Referensi")).toBe(true);
    expect(isNonContentHeading("Pranala luar")).toBe(true);
    expect(isNonContentHeading("External links")).toBe(true);
    expect(isNonContentHeading("Sejarah")).toBe(false);
  });

  it("never skips a heading level", () => {
    expect(nextHeadingLevel(0, 2)).toBe(2);
    expect(nextHeadingLevel(2, 4)).toBe(3);
    expect(nextHeadingLevel(3, 4)).toBe(4);
    expect(nextHeadingLevel(4, 4)).toBe(4);
  });

  it("slugifies deterministically", () => {
    expect(slugify("Masa Modern")).toBe("masa-modern");
    expect(slugify("Sastra & Budaya")).toBe("sastra-budaya");
    expect(slugify("日本語")).toBe("bagian");
  });
});

describe("parseArticle", () => {
  it("separates the intro from sections", () => {
    const parsed = parseArticle(SAMPLE);
    expect(parsed.intro).toContain("Batik adalah kain bergambar.");
    expect(parsed.sections.map((section) => section.title)).toEqual([
      "Sejarah",
      "Masa modern",
      "Detail",
      "Budaya",
    ]);
  });

  it("drops navigation sections and their bodies", () => {
    const parsed = parseArticle(SAMPLE);
    expect(parsed.sections.some((section) => section.title === "Referensi")).toBe(false);
    expect(parsed.intro).not.toContain("Daftar pustaka");
    expect(parsed.sections.every((section) => !section.paragraphs.join(" ").includes("tidak perlu"))).toBe(
      true,
    );
  });

  it("assigns unique ids and sane levels", () => {
    const parsed = parseArticle(SAMPLE);
    const ids = parsed.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(parsed.sections.map((section) => section.level)).toEqual([2, 3, 4, 2]);
  });

  it("deduplicates repeated headings", () => {
    const parsed = parseArticle("== Sejarah ==\nA\n== Sejarah ==\nB\n== Sejarah ==\nC");
    expect(parsed.sections.map((section) => section.id)).toEqual([
      "sejarah",
      "sejarah-2",
      "sejarah-3",
    ]);
  });

  it("drops empty sections and collapses blank lines", () => {
    const parsed = parseArticle("Pembuka.\n\n== Kosong ==\n\n\n\n== Isi ==\n\nTeks.\n\n");
    expect(parsed.sections.map((section) => section.title)).toEqual(["Isi"]);
    expect(parsed.sections[0].paragraphs).toEqual(["Teks."]);
  });

  it("handles text without headings and text that is only whitespace", () => {
    const plain = parseArticle("Hanya satu paragraf tanpa bagian.");
    expect(plain.intro).toBe("Hanya satu paragraf tanpa bagian.");
    expect(plain.sections).toEqual([]);

    const empty = parseArticle("   \n\n  ");
    expect(empty.intro).toBe("");
    expect(empty.sections).toEqual([]);
    expect(empty.wordCount).toBe(0);
  });

  it("keeps very short articles usable", () => {
    const parsed = parseArticle("Singkat.");
    expect(parsed.wordCount).toBeGreaterThan(0);
    expect(parsed.intro).toBe("Singkat.");
  });

  it("counts words across intro and sections", () => {
    const parsed = parseArticle("satu dua tiga\n\n== Bagian ==\nempat lima");
    expect(parsed.wordCount).toBe(6);
    expect(wordCount("a b  c")).toBe(3);
  });

  it("scales with hundreds of sections", () => {
    const text = Array.from({ length: 300 }, (_, index) => `== Bagian ${index} ==\nIsi ${index}.`).join(
      "\n",
    );
    const parsed = parseArticle(text);
    expect(parsed.sections).toHaveLength(300);
  });
});

describe("reading time", () => {
  it("counts at 200 words per minute", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(200)).toBe(1);
    expect(readingMinutes(600)).toBe(3);
  });
});

describe("paragraphs", () => {
  it("splits non-empty lines and trims", () => {
    expect(toParagraphs("  Satu  \n\n Dua \n")).toEqual(["Satu", "Dua"]);
  });
});
