/** Stable 32-bit FNV-1a hash, used for deterministic covers and text guards. */
export function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function textHash(value: string): string {
  return fnv1a(value).toString(36);
}
