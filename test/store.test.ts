import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SETTINGS, type Card, type Settings } from "@/lib/types";

const KEY = {
  settings: "wikinder:v2:settings",
  collection: "wikinder:v2:collection",
  seen: "wikinder:v2:seen",
  hidden: "wikinder:v2:hidden",
  resume: "wikinder:v2:resume",
  highlights: "wikinder:v2:highlights",
} as const;

const LEGACY = {
  settings: "wikinder:v1:settings",
  collection: "wikinder:v1:collection",
  seen: "wikinder:v1:seen",
  hidden: "wikinder:v1:hidden",
} as const;

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

const EMPTY_SNAPSHOT_SHAPE = {
  settings: DEFAULT_SETTINGS,
  collection: [],
  seen: [],
  hidden: [],
  resume: [],
  highlights: [],
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("settings migration", () => {
  it("renames the v1 themes", async () => {
    const store = await loadStore(new MemoryStorage());
    expect(store.migrateSettings({ theme: "kertas" }).theme).toBe("terang");
    expect(store.migrateSettings({ theme: "malam" }).theme).toBe("gelap");
  });

  it("snaps arbitrary line heights to the three supported steps", async () => {
    const store = await loadStore(new MemoryStorage());
    expect(store.migrateSettings({ lineHeight: 1.62 }).lineHeight).toBe(1.65);
    expect(store.migrateSettings({ lineHeight: 1.2 }).lineHeight).toBe(1.5);
    expect(store.migrateSettings({ lineHeight: 2.1 }).lineHeight).toBe(1.8);
  });

  it("clamps speech rate and drops unknown values", async () => {
    const store = await loadStore(new MemoryStorage());
    expect(store.migrateSettings({ speechRate: 3 }).speechRate).toBe(1.5);
    expect(store.migrateSettings({ speechRate: 0.2 }).speechRate).toBe(0.8);
    const fallback = store.migrateSettings({ theme: "neon", motion: "warp", measure: "x" });
    expect(fallback.theme).toBe("system");
    expect(fallback.motion).toBe("system");
    expect(fallback.measure).toBe("normal");
  });
});

describe("store hydration", () => {
  it("starts from defaults so the first render matches the server", async () => {
    const store = await loadStore(new MemoryStorage());
    expect(store.readStore()).toEqual({
      ...EMPTY_SNAPSHOT_SHAPE,
      hydrated: false,
      storageFailed: false,
    });
  });

  it("reads v2 payloads written by earlier sessions", async () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, theme: "sepia", lang: "en" };
    const storage = new MemoryStorage({
      [KEY.settings]: JSON.stringify({ v: 2, data: settings }),
      [KEY.seen]: JSON.stringify({ v: 2, data: [1, 2, 2, 3] }),
      [KEY.hidden]: JSON.stringify({ v: 2, data: [9] }),
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings.theme).toBe("sepia");
    expect(store.readStore().settings.lang).toBe("en");
    expect(store.readStore().seen).toEqual([1, 2, 3]);
    expect(store.readStore().hidden).toEqual([9]);
  });

  it("migrates v1 keys when no v2 payload exists", async () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, theme: "gelap", lang: "jv" };
    const storage = new MemoryStorage({
      [LEGACY.settings]: JSON.stringify({ v: 1, data: settings }),
      [LEGACY.collection]: JSON.stringify({ v: 1, data: [{ card: CARD, savedAt: 1, status: "want" }] }),
      [LEGACY.seen]: JSON.stringify({ v: 1, data: [5] }),
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings.lang).toBe("jv");
    expect(store.readStore().collection).toHaveLength(1);
    expect(store.readStore().seen).toEqual([5]);
  });

  it("survives corrupt JSON", async () => {
    const storage = new MemoryStorage({
      [KEY.settings]: "{not json",
      [KEY.collection]: "[]",
      [KEY.seen]: '"nope"',
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings).toEqual(DEFAULT_SETTINGS);
    expect(store.readStore().collection).toEqual([]);
    expect(store.readStore().seen).toEqual([]);
  });

  it("keeps valid fields when one setting is invalid", async () => {
    const storage = new MemoryStorage({
      [KEY.settings]: JSON.stringify({
        v: 2,
        data: { theme: "neon", textSize: 9, lang: "jv", imageOnly: true },
      }),
    });

    const store = await loadStore(storage);
    store.hydrateStore();

    expect(store.readStore().settings).toMatchObject({
      theme: "system",
      textSize: 1,
      lang: "jv",
      imageOnly: true,
    });
  });

  it("works when localStorage is unavailable and reports the failure", async () => {
    vi.stubGlobal("localStorage", undefined);
    vi.resetModules();
    const store = await import("@/lib/store");

    expect(() => store.hydrateStore()).not.toThrow();
    store.updateSettings({ theme: "gelap" });
    expect(store.readStore().settings.theme).toBe("gelap");
    expect(store.readStore().storageFailed).toBe(true);
    expect(store.isHydrated()).toBe(true);
  });
});

describe("store writes", () => {
  it("persists settings with the v2 wrapper", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    store.updateSettings({ theme: "kontras", textSize: 4 });

    const raw = storage.getItem(KEY.settings);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? "{}") as { v: number; data: Settings };
    expect(parsed.v).toBe(2);
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

  it("keeps at most 100 resume entries, most recent first", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    for (let index = 0; index < 105; index += 1) {
      store.saveResume({
        pageId: index + 1,
        lang: "id",
        sectionId: `bagian-${index}`,
        sectionTitle: `Bagian ${index}`,
        offset: 0.5,
      });
    }

    const resume = store.readStore().resume;
    expect(resume).toHaveLength(100);
    expect(resume[0].pageId).toBe(105);
  });

  it("adds highlights idempotently", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();

    const entry = {
      pageId: 42,
      lang: "id" as const,
      sectionId: "sejarah",
      paragraphIndex: 1,
      textHash: "abc",
    };
    store.addHighlight(entry);
    store.addHighlight(entry);
    expect(store.readStore().highlights).toHaveLength(1);

    store.removeHighlight(42, "sejarah", 1);
    expect(store.readStore().highlights).toHaveLength(0);
  });

  it("clears every key and resets the snapshot", async () => {
    const storage = new MemoryStorage();
    const store = await loadStore(storage);
    store.hydrateStore();
    store.updateSettings({ theme: "gelap" });
    store.saveCard(CARD);
    store.markSeen(7);
    store.hideCard(8);

    store.clearAllData();

    expect(storage.dump()).toEqual({});
    expect(store.readStore()).toEqual({
      ...EMPTY_SNAPSHOT_SHAPE,
      hydrated: true,
      storageFailed: false,
    });
  });
});
