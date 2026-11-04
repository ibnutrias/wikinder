import { describe, expect, it } from "vitest";

import {
  headingLevel,
  headingText,
  isNonContentHeading,
  parseArticle,
  readingMinutes,
} from "@/lib/article";

const SAMPLE = `Kopi luwak adalah kopi yang dibuat dari biji kopi yang telah dimakan musang.

Kopi ini terkenal karena prosesnya yang tidak biasa.

== Sejarah ==
Kopi luwak mulai dikenal pada masa kolonial.

=== Penyebaran ===
Budidaya menyebar ke beberapa daerah.

== Referensi ==
* Buku tentang kopi.

== Lihat pula ==
* Kopi

== Pranala luar ==
* Situs resmi.
`;

describe("heading helpers", () => {
  it("reads heading level and text", () => {
    expect(headingLevel("== Sejarah ==")).toBe(2);
    expect(headingLevel("=== Penyebaran ===")).toBe(3);
    expect(headingLevel("Bukan judul")).toBeNull();
    expect(headingText("== Sejarah ==")).toBe("Sejarah");
    expect(headingText("== Sejarah [sunting] ==")).toBe("Sejarah");
  });

  it("recognises navigation headings in both languages", () => {
    for (const title of [
      "Referensi",
      "Pranala luar",
      "Lihat pula",
      "Bacaan lanjutan",
      "Pustaka",
      "Catatan kaki",
      "References",
      "External links",
      "See also",
      "Further reading",
      "Notes",
    ]) {
      expect(isNonContentHeading(title), title).toBe(true);
    }
    expect(isNonContentHeading("Sejarah")).toBe(false);
  });
});

describe("parseArticle", () => {
  it("separates the lead paragraph from sections", () => {
    const { intro, sections } = parseArticle(SAMPLE);
    expect(intro).toContain("Kopi luwak adalah kopi");
    expect(intro).not.toContain("Sejarah");
    expect(sections.map((section) => section.title)).toEqual(["Sejarah"]);
  });

  it("nests deeper headings inside their parent section", () => {
    const { sections } = parseArticle(SAMPLE);
    expect(sections[0].body).toContain("masa kolonial");
    expect(sections[0].subsections).toEqual([
      { title: "Penyebaran", body: "Budidaya menyebar ke beberapa daerah." },
    ]);
  });

  it("drops reference and external-link sections entirely", () => {
    const parsed = JSON.stringify(parseArticle(SAMPLE));
    expect(parsed).not.toContain("Buku tentang kopi");
    expect(parsed).not.toContain("Situs resmi");
    expect(parsed).not.toContain("Lihat pula");
  });

  it("handles text with no headings", () => {
    const { intro, sections } = parseArticle("Hanya satu paragraf pendek.");
    expect(intro).toBe("Hanya satu paragraf pendek.");
    expect(sections).toEqual([]);
  });

  it("handles empty input", () => {
    expect(parseArticle("")).toEqual({ intro: "", sections: [] });
  });

  it("keeps a deep heading that appears before any level-2 heading", () => {
    const { sections } = parseArticle("=== Awal ===\nIsi bagian.");
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Awal");
  });

  it("does not emit empty sections", () => {
    const { sections } = parseArticle("== Kosong ==\n\n== Berisi ==\nAda isi.");
    expect(sections.map((section) => section.title)).toEqual(["Berisi"]);
  });
});

describe("readingMinutes", () => {
  it("rounds up to at least one minute", () => {
    expect(readingMinutes("dua kata")).toBe(1);
    expect(readingMinutes(Array.from({ length: 600 }, () => "kata").join(" "))).toBe(3);
  });
});
