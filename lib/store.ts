import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  type Card,
  type CollectionItem,
  type Lang,
  type Settings,
  type TextSize,
  type Theme,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Keys and schema                                                            */
/* -------------------------------------------------------------------------- */

export const STORE_VERSION = 1;
export const STORE_PREFIX = `wikinder:v${STORE_VERSION}:`;

export const STORAGE_KEYS = {
  settings: `${STORE_PREFIX}settings`,
  collection: `${STORE_PREFIX}collection`,
  seen: `${STORE_PREFIX}seen`,
  hidden: `${STORE_PREFIX}hidden`,
} as const;

export const MAX_COLLECTION = 500;
export const MAX_SEEN = 200;

export type Snapshot = {
  settings: Settings;
  collection: CollectionItem[];
  seen: number[];
  hidden: number[];
};

const EMPTY_SNAPSHOT: Snapshot = {
  settings: DEFAULT_SETTINGS,
  collection: [],
  seen: [],
  hidden: [],
};

/* -------------------------------------------------------------------------- */
/* Defensive readers                                                          */
/* -------------------------------------------------------------------------- */

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(): StorageLike | null {
  try {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage;
  } catch {
    // Safari in private mode throws on access.
    return null;
  }
}

function readJSON(key: string): unknown {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    // Corrupt payload: treat as absent rather than crashing the app.
    return null;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage disabled mid-session.
    return false;
  }
}

function removeKey(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* best effort */
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const THEMES: readonly Theme[] = ["kertas", "malam", "sepia", "kontras"];
const LANGS: readonly Lang[] = ["id", "en", "jv", "su"];

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 4;
}

/* -------------------------------------------------------------------------- */
/* Migrations                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Accepts any historical settings payload. Every field falls back to its
 * default so a single bad value never wipes the rest.
 */
export function migrateSettings(raw: unknown): Settings {
  const settings: Settings = { ...DEFAULT_SETTINGS };
  if (isRecord(raw) && "v" in raw && isRecord(raw.data)) {
    return migrateSettings(raw.data);
  }
  if (!isRecord(raw)) return settings;

  if (isTheme(raw.theme)) settings.theme = raw.theme;
  if (isTextSize(raw.textSize)) settings.textSize = raw.textSize;
  if (raw.fontChoice === "serif" || raw.fontChoice === "sans") {
    settings.fontChoice = raw.fontChoice;
  }
  if (
    typeof raw.lineHeight === "number" &&
    Number.isFinite(raw.lineHeight) &&
    raw.lineHeight >= 1.2 &&
    raw.lineHeight <= 2.2
  ) {
    settings.lineHeight = Math.round(raw.lineHeight * 100) / 100;
  }
  if (isLang(raw.lang)) settings.lang = raw.lang;
  if (typeof raw.imageOnly === "boolean") settings.imageOnly = raw.imageOnly;
  return settings;
}

function migrateCard(raw: unknown): Card | null {
  if (!isRecord(raw)) return null;
  const pageId = typeof raw.pageId === "number" ? raw.pageId : Number(raw.pageId);
  if (!Number.isFinite(pageId) || pageId <= 0) return null;
  if (!isLang(raw.lang)) return null;
  if (typeof raw.title !== "string" || raw.title.trim() === "") return null;
  if (typeof raw.extract !== "string") return null;

  let thumbnail: Card["thumbnail"];
  if (isRecord(raw.thumbnail)) {
    const { src, width, height } = raw.thumbnail;
    if (
      typeof src === "string" &&
      typeof width === "number" &&
      typeof height === "number" &&
      width > 0 &&
      height > 0
    ) {
      thumbnail = { src, width, height };
    }
  }

  return {
    pageId,
    lang: raw.lang,
    title: raw.title,
    extract: raw.extract,
    ...(thumbnail ? { thumbnail } : {}),
    url: typeof raw.url === "string" ? raw.url : "",
  };
}

export function migrateCollection(raw: unknown): CollectionItem[] {
  if (isRecord(raw) && "v" in raw && Array.isArray(raw.data)) {
    return migrateCollection(raw.data);
  }
  if (!Array.isArray(raw)) return [];

  const items: CollectionItem[] = [];
  const seen = new Set<number>();
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const card = migrateCard(entry.card);
    if (!card || seen.has(card.pageId)) continue;
    if (entry.status !== "want" && entry.status !== "read") continue;
    const savedAt =
      typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
        ? entry.savedAt
        : Date.now();
    seen.add(card.pageId);
    items.push({ card, savedAt, status: entry.status });
    if (items.length >= MAX_COLLECTION) break;
  }
  return items;
}

export function migrateIdList(raw: unknown, max = MAX_SEEN): number[] {
  if (isRecord(raw) && "v" in raw && Array.isArray(raw.data)) {
    return migrateIdList(raw.data, max);
  }
  if (!Array.isArray(raw)) return [];
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const value of raw) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    ids.push(value);
  }
  return ids.length > max ? ids.slice(ids.length - max) : ids;
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

let snapshot: Snapshot = EMPTY_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

function commit(next: Snapshot): void {
  snapshot = next;
  emit();
}

function persist(key: string, data: unknown): void {
  writeJSON(key, { v: STORE_VERSION, data });
}

/** Reads localStorage once per page load and merges it into the store. */
export function hydrateStore(): void {
  if (hydrated) return;
  hydrated = true;

  const settings = migrateSettings(readJSON(STORAGE_KEYS.settings));
  const collection = migrateCollection(readJSON(STORAGE_KEYS.collection));
  const seen = migrateIdList(readJSON(STORAGE_KEYS.seen));
  const hidden = migrateIdList(readJSON(STORAGE_KEYS.hidden));

  commit({ settings, collection, seen, hidden });
}

export function isHydrated(): boolean {
  return hydrated;
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export function updateSettings(patch: Partial<Settings>): void {
  const settings = migrateSettings({ ...snapshot.settings, ...patch });
  persist(STORAGE_KEYS.settings, settings);
  commit({ ...snapshot, settings });
}

export function resetSettings(): void {
  persist(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  commit({ ...snapshot, settings: { ...DEFAULT_SETTINGS } });
}

export function saveCard(card: Card): void {
  if (snapshot.collection.some((item) => item.card.pageId === card.pageId)) return;
  const item: CollectionItem = { card, savedAt: Date.now(), status: "want" };
  const collection = [item, ...snapshot.collection].slice(0, MAX_COLLECTION);
  persist(STORAGE_KEYS.collection, collection);
  commit({ ...snapshot, collection });
}

export function removeCard(pageId: number): void {
  const collection = snapshot.collection.filter((item) => item.card.pageId !== pageId);
  persist(STORAGE_KEYS.collection, collection);
  commit({ ...snapshot, collection });
}

export function setCardStatus(pageId: number, status: CollectionItem["status"]): void {
  const collection = snapshot.collection.map((item) =>
    item.card.pageId === pageId ? { ...item, status } : item,
  );
  persist(STORAGE_KEYS.collection, collection);
  commit({ ...snapshot, collection });
}

/** Restores a card that was just removed, keeping its original timestamp. */
export function restoreCard(item: CollectionItem): void {
  if (snapshot.collection.some((entry) => entry.card.pageId === item.card.pageId)) return;
  const collection = [...snapshot.collection, item].slice(0, MAX_COLLECTION);
  persist(STORAGE_KEYS.collection, collection);
  commit({ ...snapshot, collection });
}

export function markSeen(pageId: number): void {
  if (snapshot.seen.includes(pageId)) return;
  const seen = [...snapshot.seen, pageId];
  const trimmed = seen.length > MAX_SEEN ? seen.slice(seen.length - MAX_SEEN) : seen;
  persist(STORAGE_KEYS.seen, trimmed);
  commit({ ...snapshot, seen: trimmed });
}

export function markSeenBatch(pageIds: readonly number[]): void {
  let seen = snapshot.seen;
  for (const pageId of pageIds) {
    if (seen.includes(pageId)) continue;
    seen = [...seen, pageId];
  }
  if (seen.length > MAX_SEEN) seen = seen.slice(seen.length - MAX_SEEN);
  persist(STORAGE_KEYS.seen, seen);
  commit({ ...snapshot, seen });
}

export function hideCard(pageId: number): void {
  if (snapshot.hidden.includes(pageId)) return;
  const hidden = [...snapshot.hidden, pageId];
  persist(STORAGE_KEYS.hidden, hidden);
  commit({ ...snapshot, hidden });
}

export function unhideCard(pageId: number): void {
  const hidden = snapshot.hidden.filter((id) => id !== pageId);
  persist(STORAGE_KEYS.hidden, hidden);
  commit({ ...snapshot, hidden });
}

export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) removeKey(key);
  commit({
    settings: { ...DEFAULT_SETTINGS },
    collection: [],
    seen: [],
    hidden: [],
  });
}

export function readStore(): Snapshot {
  return snapshot;
}

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

export function useStore(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSettings(): Settings {
  return useStore().settings;
}

export function useCollection(): CollectionItem[] {
  return useStore().collection;
}

export function useSeen(): number[] {
  return useStore().seen;
}

export function useHidden(): number[] {
  return useStore().hidden;
}

export function useCollectionCount(): number {
  return useStore().collection.length;
}
