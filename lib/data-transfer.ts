import { migrateCollection, migrateSettings } from "./store";
import type { CollectionItem, Settings } from "./types";

export const EXPORT_VERSION = 1;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export type ExportPayload = {
  version: number;
  exportedAt: string;
  settings: Settings;
  collection: CollectionItem[];
};

export type ImportSuccess = {
  ok: true;
  settings: Settings;
  collection: CollectionItem[];
};

export type ImportFailure = {
  ok: false;
  reason: "shape" | "empty";
};

export function buildExport(
  settings: Settings,
  collection: CollectionItem[],
  now = new Date(),
): ExportPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    settings,
    collection,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Strict import: accepts only the payload Wikinder itself exports, keeps valid
 * entries and reports failure when nothing usable remains. Unknown properties
 * are ignored rather than merged, so a crafted file cannot inject state.
 */
export function parseImport(raw: unknown): ImportSuccess | ImportFailure {
  if (!isRecord(raw) || typeof raw.version !== "number") {
    return { ok: false, reason: "shape" };
  }
  if (!("settings" in raw) && !("collection" in raw)) {
    return { ok: false, reason: "shape" };
  }

  const settings = migrateSettings(raw.settings);
  const collection = migrateCollection(raw.collection);

  if (collection.length === 0 && !isRecord(raw.settings)) {
    return { ok: false, reason: "empty" };
  }

  return { ok: true, settings, collection };
}

/** Union by page id; incoming entries win so a newer export can refresh status. */
export function mergeCollections(
  current: CollectionItem[],
  incoming: CollectionItem[],
): CollectionItem[] {
  const byId = new Map<number, CollectionItem>();
  for (const item of current) byId.set(item.card.pageId, item);
  for (const item of incoming) byId.set(item.card.pageId, item);
  return Array.from(byId.values()).sort((a, b) => b.savedAt - a.savedAt);
}

export function exportFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `wikinder-${stamp}.json`;
}
