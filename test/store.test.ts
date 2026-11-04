import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SETTINGS,
  type Card,
  type Settings,
} from "@/lib/types";

const KEYS = {
  settings: "wikinder:v1:settings",
  collection: "wikinder:v1:collection",
  seen: "wikinder:v1:seen",
  hidden: "wikinder:v1:hidden",
};

class MemoryStorage {
  private map = new Map<string, string>();
  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.map.set(key, value);
  }
  get length(): number {
    return this.map.size;
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  clear(): void {
    this.map.clear();
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  dump(): Record<string, string> {
    return Object.fromEntries(this.map);
  }
}

const CARD: Card = {
  pageId: 42,
  lang: "id",
  title: "Kopi luwak",
  extract: "Kopi luwak adalah kopi yang dibuat dari biji kopi yang telah dimakan musang.",
  url: "https://id.wikipedia.org/wiki/Kopi_luwak",
};

async function loadStore(storage: MemoryStorage) {
  vi.stubGlobal("localStorage", storage);
  vi.resetModules();
  return import("@/lib/store");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("store hydration", () => {
  it("starts from defaults so the first render matches the server", async () => {
    const store = await loadStore(new MemoryStorage());
    expect(store.readStore()).toEqual({
      settings: DEFAULT_SETTINGS,
      collection: [],
      seen: [],
      hidden: [],
    });
  });

  it("reads versioned payloads written by earlier sessions", async () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, theme: "sepia", lang: "en" };
    const storage = new MemoryStorage({
      [KEYS.settings]: JSON.stringify({ v: 1, data: settings }),
      [KEYS.seen]: JSON.stringify({ v: 1, data: [1, 2, 2, 3] }),
      [KEYS.hidden]: JSON.stringify({ v: 1, data: [9] }),
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings.theme).toBe("sepia");
    expect(store.readStore().settings.lang).toBe("en");
    expect(store.readStore().seen).toEqual([1, 2, 3]);
    expect(store.readStore().hidden).toEqual([9]);
  });

  it("survives corrupt JSON", async () => {
    const storage = new MemoryStorage({
      [KEYS.settings]: "{not json",
      [KEYS.collection]: "[]",
      [KEYS.seen]: '"nope"',
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings).toEqual(DEFAULT_SETTINGS);
    expect(store.readStore().collection).toEqual([]);
    expect(store.readStore().seen).toEqual([]);
  });

  it("keeps valid fields when one setting is invalid", async () => {
    const storage = new MemoryStorage({
      [KEYS.settings]: JSON.stringify({
        v: 1,
        data: { theme: "neon", textSize: 9, lang: "jv", imageOnly: true },
      }),
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings).toMatchObject({
      theme: "kertas",
      textSize: 2,
      lang: "jv",
      imageOnly: true,
    });
  });

  it("works when localStorage is unavailable", async () => {
    vi.stubGlobal("localStorage", undefined);
    vi.resetModules();
    const store = await import("@/lib/store");

    expect(() => store.hydrateStore()).not.toThrow();
    store.updateSettings({ theme: "malam" });
    expect(store.readStore().settings.theme).toBe("malam");
    expect(store.isHydrated()).toBe(true);
  });
});

describe("store writes", () => {
  it("persists settings with the version wrapper", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    store.updateSettings({ theme: "kontras", textSize: 4 });

    const raw = storage.getItem(KEYS.settings);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? "{}") as { v: number; data: Settings };
    expect(parsed.v).toBe(1);
    expect(parsed.data.theme).toBe("kontras");
    expect(parsed.data.textSize).toBe(4);
  });

  it("stores cards once and caps the collection at 500", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    store.saveCard(CARD);
    store.saveCard(CARD);
    expect(store.readStore().collection).toHaveLength(1);
    expect(store.readStore().collection[0].status).toBe("want");

    for (let index = 0; index < 505; index += 1) {
      store.saveCard({ ...CARD, pageId: 1000 + index, title: `Artikel ${index}` });
    }
    expect(store.readStore().collection).toHaveLength(500);
  });

  it("restores a removed card without duplicating it", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    store.saveCard(CARD);
    const item = store.readStore().collection[0];
    store.removeCard(CARD.pageId);
    expect(store.readStore().collection).toHaveLength(0);

    store.restoreCard(item);
    store.restoreCard(item);
    expect(store.readStore().collection).toHaveLength(1);
  });

  it("keeps at most 200 seen ids, oldest first", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    for (let index = 0; index < 205; index += 1) store.markSeen(index + 1);

    const seen = store.readStore().seen;
    expect(seen).toHaveLength(200);
    expect(seen[0]).toBe(6);
    expect(seen[seen.length - 1]).toBe(205);
  });

  it("clears every key and resets the snapshot", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();
    store.updateSettings({ theme: "malam" });
    store.saveCard(CARD);
    store.markSeen(7);
    store.hideCard(8);

    store.clearAllData();

    expect(storage.dump()).toEqual({});
    expect(store.readStore()).toEqual({
      settings: DEFAULT_SETTINGS,
      collection: [],
      seen: [],
      hidden: [],
    });
  });
});
