import { describe, expect, it } from "vitest";

import {
  buildExport,
  exportFileName,
  mergeCollections,
  parseImport,
} from "@/lib/data-transfer";
import { DEFAULT_SETTINGS, type Card, type CollectionItem } from "@/lib/types";

const CARD: Card = {
  pageId: 7,
  lang: "id",
  title: "Batik",
  extract: "Batik adalah kain bergambar.",
  url: "https://id.wikipedia.org/wiki/Batik",
};

const ITEM: CollectionItem = { card: CARD, savedAt: 1_700_000_000_000, status: "want" };

describe("export", () => {
  it("wraps settings and collection with a version", () => {
    const payload = buildExport(DEFAULT_SETTINGS, [ITEM], new Date("2026-11-04T00:00:00Z"));
    expect(payload.version).toBe(1);
    expect(payload.exportedAt).toBe("2026-11-04T00:00:00.000Z");
    expect(payload.collection).toHaveLength(1);
  });

  it("names the file by date", () => {
    expect(exportFileName(new Date("2026-11-04T10:00:00Z"))).toBe("wikinder-2026-11-04.json");
  });
});

describe("import", () => {
  it("accepts a real export and migrates its settings", () => {
    const payload = buildExport({ ...DEFAULT_SETTINGS, theme: "gelap" }, [ITEM]);
    const result = parseImport(payload);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.theme).toBe("gelap");
    expect(result.collection).toHaveLength(1);
  });

  it("migrates legacy theme names inside an export", () => {
    const result = parseImport({
      version: 1,
      settings: { ...DEFAULT_SETTINGS, theme: "kertas" },
      collection: [],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.theme).toBe("terang");
  });

  it("rejects non-objects, arrays and missing versions", () => {
    expect(parseImport(null).ok).toBe(false);
    expect(parseImport("string").ok).toBe(false);
    expect(parseImport([]).ok).toBe(false);
    expect(parseImport({ settings: DEFAULT_SETTINGS }).ok).toBe(false);
    expect(parseImport({ version: 1 }).ok).toBe(false);
  });

  it("rejects a file whose entries are all invalid", () => {
    const result = parseImport({
      version: 1,
      settings: "nope",
      collection: [{ card: { pageId: -1 } }, { card: { title: "" } }],
    });
    expect(result.ok).toBe(false);
  });

  it("drops malicious or malformed entries but keeps valid ones", () => {
    const result = parseImport({
      version: 1,
      collection: [
        { card: { ...CARD, pageId: 8, __proto__: { polluted: true } }, savedAt: 5, status: "read" },
        { card: null, savedAt: 1, status: "want" },
        { card: CARD, savedAt: "not-a-number", status: "want" },
        { card: { ...CARD, pageId: 9 }, savedAt: 2, status: "unknown" },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.collection.map((item) => item.card.pageId)).toEqual([8, 7]);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("merge", () => {
  it("unions by page id and prefers incoming entries", () => {
    const existing: CollectionItem[] = [ITEM];
    const incoming: CollectionItem[] = [
      { ...ITEM, status: "read", savedAt: 2 },
      { card: { ...CARD, pageId: 99 }, savedAt: 3, status: "want" },
    ];
    const merged = mergeCollections(existing, incoming);
    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.card.pageId === 7)?.status).toBe("read");
    expect(merged.find((item) => item.card.pageId === 99)).toBeDefined();
  });

  it("keeps the newest entries first", () => {
    const merged = mergeCollections(
      [ITEM],
      [{ card: { ...CARD, pageId: 12 }, savedAt: 1_800_000_000_000, status: "want" }],
    );
    expect(merged[0].card.pageId).toBe(12);
  });
});
