import { describe, expect, it } from "vitest";

import { formatApaCitation, formatPlainCitation, permanentUrl } from "@/lib/citation";

const INPUT = {
  title: "Batik",
  pageId: 12345,
  langCode: "id",
  langLabel: "Indonesia",
  host: "id.wikipedia.org",
  accessedAt: new Date(2026, 10, 4),
};

describe("citation", () => {
  it("builds a permanent URL from the page id", () => {
    expect(permanentUrl(INPUT)).toBe("https://id.wikipedia.org/w/index.php?curid=12345");
  });

  it("formats plain text with title, access date and licence", () => {
    const text = formatPlainCitation(INPUT);
    expect(text).toContain("Batik");
    expect(text).toContain("Wikipedia bahasa Indonesia (id)");
    expect(text).toContain("4 November 2026");
    expect(text).toContain("curid=12345");
    expect(text).toContain("CC BY-SA 4.0");
  });

  it("formats a short APA reference", () => {
    const text = formatApaCitation(INPUT);
    expect(text).toContain("Batik. (2026).");
    expect(text).toContain("Diakses 4 November 2026");
  });
});
