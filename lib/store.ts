import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  LINE_HEIGHTS,
  MEASURES,
  MOTION_PREFERENCES,
  SESSION_LENGTHS,
  TEXT_SIZES,
  THEMES,
  TOUCH_TARGETS,
  type Card,
  type CollectionItem,
  type Highlight,
  type Lang,
  type ResumeEntry,
  type Settings,
  type TextSize,
  type Theme,
  type ThemeChoice,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Keys and schema                                                            */
/* -------------------------------------------------------------------------- */

export const STORE_VERSION = 2;
export const STORE_PREFIX = `wikinder:v${STORE_VERSION}:`;
const LEGACY_PREFIX = "wikinder:v1:";

export const STORAGE_KEYS = {
  settings: `${STORE_PREFIX}settings`,
  collection: `${STORE_PREFIX}collection`,
  seen: `${STORE_PREFIX}seen`,
  hidden: `${STORE_PREFIX}hidden`,
  resume: `${STORE_PREFIX}resume`,
  highlights: `${STORE_PREFIX}highlights`,
} as const;

const LEGACY_KEYS = {
  settings: `${LEGACY_PREFIX}settings`,
  collection: `${LEGACY_PREFIX}collection`,
  seen: `${LEGACY_PREFIX}seen`,
  hidden: `${LEGACY_PREFIX}hidden`,
} as const;

export const MAX_COLLECTION = 500;
export const MAX_SEEN = 200;
export const MAX_RESUME = 100;
export const MAX_HIGHLIGHTS = 500;

export type Snapshot = {
  settings: Settings;
  collection: CollectionItem[];
  seen: number[];
  hidden: number[];
  resume: ResumeEntry[];
  highlights: Highlight[];
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  /** True when persistence failed (quota, private mode). Show one gentle notice. */
  storageFailed: boolean;
};

const EMPTY_SNAPSHOT: Snapshot = {
  settings: DEFAULT_SETTINGS,
  collection: [],
  seen: [],
  hidden: [],
  resume: [],
  highlights: [],
  hydrated: false,
  storageFailed: false,
};

/* -------------------------------------------------------------------------- */
/* Defensive storage                                                          */
/* -------------------------------------------------------------------------- */

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(): StorageLike | null {
  try {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage;
  } catch {
    // Safari private mode throws on access.
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
    return null;
  }
}

let persistenceFailed = false;

function writeJSON(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) {
    persistenceFailed = true;
    return false;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    persistenceFailed = true;
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

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

function isLang(value: unknown): value is Lang {
  return value === "id" || value === "en" || value === "jv" || value === "su";
}

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "number" && (TEXT_SIZES as readonly number[]).includes(value);
}

function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "system" || isTheme(value);
}

function isSessionLength(value: unknown): value is Settings["sessionLength"] {
  return typeof value === "number" && (SESSION_LENGTHS as readonly number[]).includes(value);
}

function nearestLineHeight(value: number): number {
  return LINE_HEIGHTS.reduce(
    (closest, candidate) =>
      Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest,
    LINE_HEIGHTS[1],
  );
}

function unwrapEnvelope(raw: unknown): unknown {
  if (isRecord(raw) && "data" in raw) return raw.data;
  return raw;
}

/* -------------------------------------------------------------------------- */
/* Migrations                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Accepts any historical settings payload. Every field falls back to its
 * default so a single bad value never wipes the rest.
 */
export function migrateSettings(raw: unknown): Settings {
  const source = unwrapEnvelope(raw);
  const settings: Settings = { ...DEFAULT_SETTINGS };
  if (!isRecord(source)) return settings;

  // v1 → v2 renames.
  const legacyTheme = source.theme;
  if (legacyTheme === "kertas") settings.theme = "terang";
  else if (legacyTheme === "malam") settings.theme = "gelap";
  else if (isThemeChoice(legacyTheme)) settings.theme = legacyTheme;

  if (isTextSize(source.textSize)) settings.textSize = source.textSize;
  if (isTextSize(source.textSizev2)) settings.textSize = source.textSizev2;

  if (source.fontChoice === "serif" || source.fontChoice === "sans") {
    settings.fontChoice = source.fontChoice;
  }

  if (typeof source.lineHeight === "number" && Number.isFinite(source.lineHeight)) {
    settings.lineHeight = nearestLineHeight(source.lineHeight);
  }

  if (typeof source.measure === "string" && (MEASURES as readonly string[]).includes(source.measure)) {
    settings.measure = source.measure as Settings["measure"];
  }

  if (isLang(source.lang)) settings.lang = source.lang;
  if (typeof source.imageOnly === "boolean") settings.imageOnly = source.imageOnly;
  if (isSessionLength(source.sessionLength)) settings.sessionLength = source.sessionLength;
  if (typeof source.haptics === "boolean") settings.haptics = source.haptics;
  if (typeof source.openAllSections === "boolean") settings.openAllSections = source.openAllSections;
  if (typeof source.showTocDesktop === "boolean") settings.showTocDesktop = source.showTocDesktop;
  if (typeof source.resumePrompt === "boolean") settings.resumePrompt = source.resumePrompt;

  if (typeof source.speechRate === "number" && Number.isFinite(source.speechRate)) {
    settings.speechRate = Math.min(1.5, Math.max(0.8, Math.round(source.speechRate * 10) / 10));
  }

  if (
    typeof source.motion === "string" &&
    (MOTION_PREFERENCES as readonly string[]).includes(source.motion)
  ) {
    settings.motion = source.motion as Settings["motion"];
  }

  if (
    typeof source.touchTarget === "string" &&
    (TOUCH_TARGETS as readonly string[]).includes(source.touchTarget)
  ) {
    settings.touchTarget = source.touchTarget as Settings["touchTarget"];
  }

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
  const source = unwrapEnvelope(raw);
  if (!Array.isArray(source)) return [];

  const items: CollectionItem[] = [];
  const ids = new Set<number>();
  for (const entry of source) {
    if (!isRecord(entry)) continue;
    const card = migrateCard(entry.card);
    if (!card || ids.has(card.pageId)) continue;
    if (entry.status !== "want" && entry.status !== "read") continue;
    const savedAt =
      typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
        ? entry.savedAt
        : Date.now();
    ids.add(card.pageId);
    items.push({ card, savedAt, status: entry.status });
    if (items.length >= MAX_COLLECTION) break;
  }
  return items;
}

export function migrateIdList(raw: unknown, max = MAX_SEEN): number[] {
  const source = unwrapEnvelope(raw);
  if (!Array.isArray(source)) return [];
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const value of source) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    ids.push(value);
  }
  return ids.length > max ? ids.slice(ids.length - max) : ids;
}

export function migrateResume(raw: unknown): ResumeEntry[] {
  const source = unwrapEnvelope(raw);
  if (!Array.isArray(source)) return [];
  const entries: ResumeEntry[] = [];
  const ids = new Set<number>();
  for (const entry of source) {
    if (!isRecord(entry)) continue;
    if (typeof entry.pageId !== "number" || entry.pageId <= 0) continue;
    if (!isLang(entry.lang)) continue;
    if (typeof entry.sectionId !== "string") continue;
    if (typeof entry.sectionTitle !== "string") continue;
    if (ids.has(entry.pageId)) continue;
    const offset =
      typeof entry.offset === "number" && Number.isFinite(entry.offset)
        ? Math.min(1, Math.max(0, entry.offset))
        : 0;
    ids.add(entry.pageId);
    entries.push({
      pageId: entry.pageId,
      lang: entry.lang,
      sectionId: entry.sectionId,
      sectionTitle: entry.sectionTitle,
      offset,
      updatedAt:
        typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt)
          ? entry.updatedAt
          : 0,
    });
  }
  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  return entries.slice(0, MAX_RESUME);
}

export function migrateHighlights(raw: unknown): Highlight[] {
  const source = unwrapEnvelope(raw);
  if (!Array.isArray(source)) return [];
  const items: Highlight[] = [];
  for (const entry of source) {
    if (!isRecord(entry)) continue;
    if (typeof entry.pageId !== "number" || entry.pageId <= 0) continue;
    if (!isLang(entry.lang)) continue;
    if (typeof entry.sectionId !== "string") continue;
    if (typeof entry.paragraphIndex !== "number") continue;
    if (typeof entry.textHash !== "string") continue;
    items.push({
      pageId: entry.pageId,
      lang: entry.lang,
      sectionId: entry.sectionId,
      paragraphIndex: entry.paragraphIndex,
      textHash: entry.textHash,
      createdAt:
        typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt)
          ? entry.createdAt
          : 0,
    });
    if (items.length >= MAX_HIGHLIGHTS) break;
  }
  return items;
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

function readWithLegacy(key: keyof typeof STORAGE_KEYS): unknown {
  const current = readJSON(STORAGE_KEYS[key]);
  if (current !== null) return current;
  const legacyKey = LEGACY_KEYS[key as keyof typeof LEGACY_KEYS];
  return legacyKey ? readJSON(legacyKey) : null;
}

/** Reads localStorage once per page load and merges it into the store. */
export function hydrateStore(): void {
  if (hydrated) return;
  hydrated = true;

  const settings = migrateSettings(readWithLegacy("settings"));
  const collection = migrateCollection(readWithLegacy("collection"));
  const seen = migrateIdList(readWithLegacy("seen"));
  const hidden = migrateIdList(readWithLegacy("hidden"));
  const resume = migrateResume(readJSON(STORAGE_KEYS.resume));
  const highlights = migrateHighlights(readJSON(STORAGE_KEYS.highlights));

  commit({ settings, collection, seen, hidden, resume, highlights, hydrated: true, storageFailed: false });
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
  const storageFailed = persistenceFailed || snapshot.storageFailed;
  commit({ ...snapshot, settings, storageFailed });
}

export function resetSettings(): void {
  persist(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  commit({ ...snapshot, settings: { ...DEFAULT_SETTINGS } });
}

export function saveCard(card: Card): void {
  if (snapshot.collection.some((item) => item.card.pageId === card.pageId)) return;
  const collection = [
    { card, savedAt: Date.now(), status: "want" as const },
    ...snapshot.collection,
  ].slice(0, MAX_COLLECTION);
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

export function clearCollection(): void {
  persist(STORAGE_KEYS.collection, []);
  commit({ ...snapshot, collection: [] });
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

export function clearSeen(): void {
  persist(STORAGE_KEYS.seen, []);
  commit({ ...snapshot, seen: [] });
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

export function saveResume(entry: Omit<ResumeEntry, "updatedAt">): void {
  const resume = [
    { ...entry, updatedAt: Date.now() },
    ...snapshot.resume.filter((item) => item.pageId !== entry.pageId),
  ].slice(0, MAX_RESUME);
  persist(STORAGE_KEYS.resume, resume);
  commit({ ...snapshot, resume });
}

export function clearResume(pageId: number): void {
  const resume = snapshot.resume.filter((item) => item.pageId !== pageId);
  persist(STORAGE_KEYS.resume, resume);
  commit({ ...snapshot, resume });
}

export function addHighlight(entry: Omit<Highlight, "createdAt">): void {
  const exists = snapshot.highlights.some(
    (item) =>
      item.pageId === entry.pageId &&
      item.sectionId === entry.sectionId &&
      item.paragraphIndex === entry.paragraphIndex,
  );
  if (exists) return;
  const highlights = [{ ...entry, createdAt: Date.now() }, ...snapshot.highlights].slice(
    0,
    MAX_HIGHLIGHTS,
  );
  persist(STORAGE_KEYS.highlights, highlights);
  commit({ ...snapshot, highlights });
}

export function removeHighlight(
  pageId: number,
  sectionId: string,
  paragraphIndex: number,
): void {
  const highlights = snapshot.highlights.filter(
    (item) =>
      !(
        item.pageId === pageId &&
        item.sectionId === sectionId &&
        item.paragraphIndex === paragraphIndex
      ),
  );
  persist(STORAGE_KEYS.highlights, highlights);
  commit({ ...snapshot, highlights });
}

export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) removeKey(key);
  for (const key of Object.values(LEGACY_KEYS)) removeKey(key);
  persistenceFailed = false;
  commit({
    ...EMPTY_SNAPSHOT,
    settings: { ...DEFAULT_SETTINGS },
    hydrated: true,
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

export function useResume(): ResumeEntry[] {
  return useStore().resume;
}

export function useHighlights(): Highlight[] {
  return useStore().highlights;
}

export function useCollectionCount(): number {
  return useStore().collection.length;
}

export function useHydrated(): boolean {
  return useStore().hydrated;
}
