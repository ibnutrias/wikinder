import type { Card } from "./types";

export const PREFETCH_THRESHOLD = 4;
export const PREFETCH_BATCH = 10;
export const MAX_SEEN = 200;

export type FilterOptions = {
  seen: readonly number[];
  hidden: readonly number[];
  /** Drop cards without a thumbnail. */
  imageOnly?: boolean;
  /** Page ids already queued in the current session. */
  exclude?: readonly number[];
};

/**
 * Keeps only cards that are new, not hidden by the reader and (optionally)
 * illustrated. Preserves upstream order.
 */
export function filterCards(cards: readonly Card[], options: FilterOptions): Card[] {
  const seen = new Set(options.seen);
  const hidden = new Set(options.hidden);
  const exclude = new Set(options.exclude ?? []);
  const kept: Card[] = [];

  for (const card of cards) {
    if (seen.has(card.pageId)) continue;
    if (hidden.has(card.pageId)) continue;
    if (exclude.has(card.pageId)) continue;
    if (options.imageOnly && !card.thumbnail) continue;
    kept.push(card);
  }
  return kept;
}

/** Appends a batch, dropping duplicates while keeping first occurrence. */
export function mergeQueue(existing: readonly Card[], incoming: readonly Card[]): Card[] {
  const ids = new Set(existing.map((card) => card.pageId));
  const merged = [...existing];
  for (const card of incoming) {
    if (ids.has(card.pageId)) continue;
    ids.add(card.pageId);
    merged.push(card);
  }
  return merged;
}

export function shouldPrefetch(remaining: number): boolean {
  return remaining <= PREFETCH_THRESHOLD;
}

/** Remembers the most recent ids, oldest dropped first. */
export function pushSeen(seen: readonly number[], pageId: number, max = MAX_SEEN): number[] {
  if (seen[seen.length - 1] === pageId) return [...seen];
  const without = seen.filter((id) => id !== pageId);
  const next = [...without, pageId];
  return next.length > max ? next.slice(next.length - max) : next;
}
