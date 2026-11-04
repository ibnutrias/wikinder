import { describe, expect, it } from "vitest";

import {
  filterCards,
  mergeQueue,
  shouldPrefetch,
  pushSeen,
  MAX_SEEN,
  PREFETCH_BATCH,
  PREFETCH_THRESHOLD,
} from "@/lib/queue";
import type { Card } from "@/lib/types";

function card(pageId: number, withImage = true): Card {
  return {
    pageId,
    lang: "id",
    title: `Artikel ${pageId}`,
    extract:
      "Sebuah ringkasan yang cukup panjang untuk lolos penyaringan kartu di aplikasi ini.",
    ...(withImage
      ? { thumbnail: { src: "https://upload.wikimedia.org/a.jpg", width: 800, height: 600 } }
      : {}),
    url: `https://id.wikipedia.org/wiki/Artikel_${pageId}`,
  };
}

describe("filterCards", () => {
  it("drops seen and hidden pages", () => {
    const cards = [card(1), card(2), card(3), card(4)];
    const kept = filterCards(cards, { seen: [1, 2], hidden: [3] });
    expect(kept.map((entry) => entry.pageId)).toEqual([4]);
  });

  it("drops unillustrated cards when imageOnly is on", () => {
    const cards = [card(1), card(2, false)];
    expect(filterCards(cards, { seen: [], hidden: [], imageOnly: true })).toHaveLength(1);
    expect(filterCards(cards, { seen: [], hidden: [], imageOnly: false })).toHaveLength(2);
  });

  it("drops cards already in the session queue", () => {
    const kept = filterCards([card(1), card(2)], {
      seen: [],
      hidden: [],
      exclude: [2],
    });
    expect(kept.map((entry) => entry.pageId)).toEqual([1]);
  });
});

describe("mergeQueue", () => {
  it("dedupes by page id and preserves order", () => {
    const merged = mergeQueue([card(1), card(2)], [card(2), card(3)]);
    expect(merged.map((entry) => entry.pageId)).toEqual([1, 2, 3]);
  });

  it("returns a new array even when nothing is added", () => {
    const existing = [card(1)];
    const merged = mergeQueue(existing, [card(1)]);
    expect(merged).toEqual(existing);
    expect(merged).not.toBe(existing);
  });
});

describe("prefetch policy", () => {
  it("asks for more when the queue is nearly empty", () => {
    expect(shouldPrefetch(0)).toBe(true);
    expect(shouldPrefetch(PREFETCH_THRESHOLD)).toBe(true);
    expect(shouldPrefetch(PREFETCH_THRESHOLD + 1)).toBe(false);
  });

  it("requests small batches because random only shifts the start point", () => {
    expect(PREFETCH_BATCH).toBe(10);
  });
});

describe("pushSeen", () => {
  it("moves an existing id to the end", () => {
    expect(pushSeen([1, 2, 3], 2)).toEqual([1, 3, 2]);
  });

  it("caps the history at 200 ids", () => {
    let seen: number[] = [];
    for (let index = 0; index < 210; index += 1) seen = pushSeen(seen, index);
    expect(seen).toHaveLength(MAX_SEEN);
    expect(seen[0]).toBe(10);
  });
});
