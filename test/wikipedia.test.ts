import { describe, expect, it } from "vitest";

import {
  articleUrl,
  isLang,
  normalizeArticle,
  normalizeCard,
  normalizeCards,
  parseLang,
  randomCardsPath,
  searchPath,
  sortCardsByIndex,
} from "@/lib/wikipedia";

const COMPLETE = {
  pageid: 123,
  title: "Kopi luwak",
  index: 2,
  extract:
    "Kopi luwak adalah kopi yang dibuat dari biji kopi pilihan yang sebelumnya telah dimakan oleh musang, lalu dicerna dan dikeluarkan kembali.",
  thumbnail: {
    source: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Kopi.jpg/800px-Kopi.jpg",
    width: 800,
    height: 600,
  },
};

describe("lang allowlist", () => {
  it("accepts only the four supported wikis", () => {
    expect(isLang("id")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("jv")).toBe(true);
    expect(isLang("su")).toBe(true);
    expect(isLang("de")).toBe(false);
    expect(isLang("")).toBe(false);
    expect(isLang(["id"])).toBe(false);
    expect(parseLang(null)).toBeNull();
  });

  it("builds api paths without a scheme or host (SSRF-safe parts)", () => {
    expect(randomCardsPath()).toContain("grnnamespace=0");
    expect(randomCardsPath()).toContain("grnlimit=10");
    expect(searchPath("id", "batik")).toContain("gsrsearch=batik");
    expect(searchPath("id", "batik")).toContain("gsrnamespace=0");
  });

  it("encodes article titles", () => {
    expect(articleUrl("id", "Kopi luwak")).toBe("https://id.wikipedia.org/wiki/Kopi_luwak");
    expect(articleUrl("en", "A/B testing")).toBe("https://en.wikipedia.org/wiki/A%2FB_testing");
  });
});

describe("normalizeCard", () => {
  it("keeps a complete card", () => {
    const card = normalizeCard(COMPLETE, "id");
    expect(card).not.toBeNull();
    expect(card).toMatchObject({
      pageId: 123,
      lang: "id",
      title: "Kopi luwak",
      thumbnail: { width: 800, height: 600 },
    });
    expect(card?.extract.startsWith("Kopi luwak adalah")).toBe(true);
  });

  it("accepts a card without an image", () => {
    const card = normalizeCard(
      {
        pageid: COMPLETE.pageid,
        title: COMPLETE.title,
        index: COMPLETE.index,
        extract: COMPLETE.extract,
      },
      "id",
    );
    expect(card).not.toBeNull();
    expect(card?.thumbnail).toBeUndefined();
  });

  it("falls back to the original image when no thumbnail exists", () => {
    const card = normalizeCard(
      {
        pageid: COMPLETE.pageid,
        title: COMPLETE.title,
        index: COMPLETE.index,
        extract: COMPLETE.extract,
        original: { source: "https://upload.wikimedia.org/a.jpg", width: 1200, height: 800 },
      },
      "en",
    );
    expect(card?.thumbnail).toEqual({
      src: "https://upload.wikimedia.org/a.jpg",
      width: 1200,
      height: 800,
    });
  });

  it("rejects an empty or stub extract", () => {
    expect(normalizeCard({ ...COMPLETE, extract: "" }, "id")).toBeNull();
    expect(normalizeCard({ ...COMPLETE, extract: "Kopi." }, "id")).toBeNull();
    expect(normalizeCard({ ...COMPLETE, extract: undefined }, "id")).toBeNull();
  });

  it("rejects disambiguation pages", () => {
    expect(
      normalizeCard({ ...COMPLETE, pageprops: { disambiguation: "" } }, "id"),
    ).toBeNull();
  });

  it("rejects payloads without an id or title", () => {
    expect(normalizeCard({ ...COMPLETE, pageid: undefined }, "id")).toBeNull();
    expect(normalizeCard({ ...COMPLETE, title: "   " }, "id")).toBeNull();
    expect(normalizeCard("not an object", "id")).toBeNull();
  });

  it("rejects insecure or malformed image urls", () => {
    const card = normalizeCard(
      {
        ...COMPLETE,
        thumbnail: { source: "http://upload.wikimedia.org/a.jpg", width: 10, height: 10 },
      },
      "id",
    );
    expect(card?.thumbnail).toBeUndefined();
  });
});

describe("normalizeCards", () => {
  it("drops unusable pages but keeps the rest", () => {
    const payload = {
      query: {
        pages: [
          COMPLETE,
          { pageid: 2, title: "Stub", extract: "Terlalu pendek." },
          { pageid: 3, title: "Disambiguasi", extract: COMPLETE.extract, pageprops: { disambiguation: "" } },
        ],
      },
    };
    expect(normalizeCards(payload, "id").map((card) => card.pageId)).toEqual([123]);
  });

  it("tolerates a missing query object", () => {
    expect(normalizeCards({}, "id")).toEqual([]);
    expect(normalizeCards(null, "id")).toEqual([]);
  });

  it("reads formatversion=1 pages keyed by id", () => {
    const payload = { query: { pages: { "123": COMPLETE } } };
    expect(normalizeCards(payload, "id")).toHaveLength(1);
  });

  it("restores upstream order from the index field", () => {
    const payload = {
      query: {
        pages: [
          { ...COMPLETE, pageid: 1, index: 3 },
          { ...COMPLETE, pageid: 2, index: 1 },
          { ...COMPLETE, pageid: 3, index: 2 },
        ],
      },
    };
    const cards = sortCardsByIndex(normalizeCards(payload, "id"), payload);
    expect(cards.map((card) => card.pageId)).toEqual([2, 3, 1]);
  });
});

describe("normalizeArticle", () => {
  it("extracts the single requested page", () => {
    const article = normalizeArticle({ query: { pages: [COMPLETE] } }, "en");
    expect(article).toMatchObject({
      pageId: 123,
      lang: "en",
      title: "Kopi luwak",
    });
  });

  it("returns null when the page is missing", () => {
    expect(normalizeArticle({ query: { pages: [] } }, "id")).toBeNull();
    expect(normalizeArticle({ error: { code: "nosuchpage" } }, "id")).toBeNull();
  });
});
