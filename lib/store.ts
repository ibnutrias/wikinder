import type { Settings } from "./copy";

type Listener = () => void;

type Snapshot = {
  settings: Settings;
  collection: import("./copy").CollectionItem[];
  seen: number[];
  hidden: number[];
};

const STORE_PREFIX = "wikinder:v1:";
const KEYS = {
  settings: STORE_PREFIX + "settings",
  collection: STORE_PREFIX + "collection",
  seen: STORE_PREFIX + "seen",
  hidden: STORE_PREFIX + "hidden",
} as const;

type Persisted = {
  version: 1;
  settings: Settings;
  collection: import("./copy").CollectionItem[];
  seen: number[];
  hidden: number[];
};

function DEFAULT_SETTINGS(): Settings {
  return {
    theme: "kertas",
    textSize: 2,
    fontChoice: "serif",
    lineHeight: 1.6,
    lang: "id",
    imageOnly: false,
  };
}

function inBoundsLang(lang: unknown): lang is Settings["lang"] {
  return lang === "id" || lang === "en" || lang === "jv" || lang === "su";
}

function inBoundsTheme(theme: unknown): theme is Settings["theme"] {
  return (
    theme === "kertas" || theme === "malam" || theme === "sepia" || theme === "kontras"
  );
}

function inBoundsFontChoice(v: unknown): v is Settings["fontChoice"] {
  return v === "serif" || v === "sans";
}

function inBoundsTextSize(v: unknown): v is Settings["textSize"] {
  return (
    (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 4) ||
    false
  );
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return null;
    const parsed: Persisted | null =
      (() => {
        try {
          const p = JSON.parse(raw) as Persisted;
          if (!p || typeof p !== "object" || p.version !== 1) return null;
          return p as Persisted;
        } catch {
          return null;
        }
      })();
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(p: Persisted): boolean {
  try {
    localStorage.setItem(KEYS.settings, JSON.stringify(p));
    localStorage.setItem(KEYS.collection, JSON.stringify(p.collection));
    localStorage.setItem(KEYS.seen, JSON.stringify(p.seen));
    localStorage.setItem(KEYS.hidden, JSON.stringify(p.hidden));
    return true;
  } catch {
    return false;
  }
}

function persistFull(snap: Snapshot): void {
  const p: Persisted = {
    version: 1,
    settings: snap.settings,
    collection: snap.collection,
    seen: snap.seen,
    hidden: snap.hidden,
  };
  writePersisted(p);
}

function migrateSettings(raw: unknown): Settings {
  const def = DEFAULT_SETTINGS();
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  const s = { ...def };
  if (inBoundsTheme(r.theme)) s.theme = r.theme;
  if (inBoundsTextSize(r.textSize)) s.textSize = r.textSize;
  if (inBoundsFontChoice(r.fontChoice)) s.fontChoice = r.fontChoice;
  if (typeof r.lineHeight === "number" && isFinite(r.lineHeight)) s.lineHeight = r.lineHeight;
  if (inBoundsLang(r.lang)) s.lang = r.lang;
  if (typeof r.imageOnly === "boolean") s.imageOnly = r.imageOnly;
  return s;
}

function migrateCollection(raw: unknown): import("./copy").CollectionItem[] {
  if (!Array.isArray(raw)) return [];
  const out: import("./copy").CollectionItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as import("./copy").CollectionItem;
    if (!r.card || typeof r.card !== "object") continue;
    const card = r.card as import("./copy").CardSummary;
    if (typeof card.pageId !== "number" || !isFinite(card.pageId)) continue;
    if (typeof card.lang !== "string" || !inBoundsLang(card.lang)) continue;
    if (typeof card.title !== "string" || !card.title) continue;
    if (typeof card.extract !== "string") continue;
    if (typeof r.savedAt !== "number" || !isFinite(r.savedAt)) continue;
    if (r.status !== "want" && r.status !== "read") continue;
    out.push({
      card: {
        pageId: card.pageId,
        lang: card.lang as Settings["lang"],
        title: card.title,
        extract: card.extract,
        thumbnail:
          card.thumbnail && typeof card.thumbnail === "object"
            ? {
                src: card.thumbnail.src,
                width: card.thumbnail.width,
                height: card.thumbnail.height,
              }
            : undefined,
        url: card.url,
      },
      savedAt: r.savedAt,
      status: r.status,
    });
  }
  if (out.length > 500) out.length = 500;
  return out;
}

function migrateList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const out: number[] = [];
  const seen = new Set<number>();
  for (const id of raw) {
    if (typeof id !== "number" || !isFinite(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  if (out.length > 200) out.length = 200;
  return out;
}

const initial: Persisted | null = readPersisted();
const initialSnapshot: Snapshot = initial
  ? {
      settings: initial.settings,
      collection: initial.collection,
      seen: initial.seen,
      hidden: initial.hidden,
    }
  : {
      settings: DEFAULT_SETTINGS(),
      collection: [],
      seen: [],
      hidden: [],
    };

function identity<T>(v: T): T {
  return v;
}

function getServerSnapshot(): Snapshot {
  return initialSnapshot;
}

let listeners = new Set<Listener>();
let current = initialSnapshot;

function snapshotStable(a: Snapshot, b: Snapshot): boolean {
  return (
    a.settings.theme === b.settings.theme &&
    a.settings.textSize === b.settings.textSize &&
    a.settings.fontChoice === b.settings.fontChoice &&
    a.settings.lineHeight === b.settings.lineHeight &&
    a.settings.lang === b.settings.lang &&
    a.settings.imageOnly === b.settings.imageOnly &&
    a.collection.length === b.collection.length &&
    a.seen.length === b.seen.length &&
    a.hidden.length === b.hidden.length
  );
}

const STORE = {
  getSnapshot: () => current,
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getServerSnapshot: getServerSnapshot,
  fullRender: true,
};

function setSettings(next: Settings): void {
  const snap = { ...current, settings: next };
  if (snapshotStable(current, snap)) return;
  current = snap;
  persistFull(snap);
  listeners.forEach((l) => l());
}

function setCollection(next: import("./copy").CollectionItem[]): void {
  const snap = { ...current, collection: next };
  if (snapshotStable(current, snap)) return;
  current = snap;
  persistFull(snap);
  listeners.forEach((l) => l());
}

function setSeen(next: number[]): void {
  const snap = { ...current, seen: next };
  if (snapshotStable(current, snap)) return;
  current = snap;
  persistFull(snap);
  listeners.forEach((l) => l());
}

function setHidden(next: number[]): void {
  const snap = { ...current, hidden: next };
  if (snapshotStable(current, snap)) return;
  current = snap;
  persistFull(snap);
  listeners.forEach((l) => l());
}

export function useSettings<T>(select: (s: Settings) => T): T {
  const snap = useSyncExternalStore(STORE.getSnapshot, STORE.subscribe);
  return select(snap.settings);
}

export function useCollection<T>(select: (c: import("./copy").CollectionItem[]) => T): T {
  const snap = useSyncExternalStore(STORE.getSnapshot, STORE.subscribe);
  return select(snap.collection);
}

export function useSeen(): number[] {
  return useSyncExternalStore(STORE.getSnapshot, STORE.subscribe).seen;
}

export function useHidden(): number[] {
  return useSyncExternalStore(STORE.getSnapshot, STORE.subscribe).hidden;
}

export function setSettingsStore(next: Settings): void {
  setSettings(next);
}

export function addToCollection(item: import("./copy").CollectionItem): boolean {
  const existing = current.collection.find((c) => c.card.pageId === item.card.pageId);
  if (existing) return false;
  const next = [...current.collection, item];
  if (next.length > 500) {
    next.length = 500;
  }
  setCollection(next);
  return true;
}

export function removeFromCollection(pageId: number): void {
  setCollection(current.collection.filter((c) => c.card.pageId !== pageId));
}

export function setCollectionStatus(pageId: number, status: "want" | "read"): void {
  setCollection(
    current.collection.map((c) => (c.card.pageId === pageId ? { ...c, status } : c)),
  );
}

export function clearCollection(): void {
  setCollection([]);
}

export function pushSeen(pageId: number): void {
  if (current.seen.includes(pageId)) return;
  const next = [...current.seen, pageId];
  if (next.length > 200) next.shift();
  setSeen(next);
}

export function addHidden(pageId: number): void {
  if (current.hidden.includes(pageId)) return;
  const next = [...current.hidden, pageId];
  if (next.length > 200) next.shift();
  setHidden(next);
}

export function removeHidden(pageId: number): void {
  setHidden(current.hidden.filter((id) => id !== pageId));
}

export function clearHidden(): void {
  setHidden([]);
}

export function clearLocalData(): void {
  try {
    localStorage.removeItem(KEYS.settings);
    localStorage.removeItem(KEYS.collection);
    localStorage.removeItem(KEYS.seen);
    localStorage.removeItem(KEYS.hidden);
  } catch {
    // private mode or quota exceeded — best effort
  }
  current = {
    settings: DEFAULT_SETTINGS(),
    collection: [],
    seen: [],
    hidden: [],
  };
  listeners.forEach((l) => l());
}

export function readLocalSnapshot(): Snapshot {
  return current;
}
