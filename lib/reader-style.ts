import type { CSSProperties } from "react";
import { MEASURE_CH, TEXT_SIZE_SCALE, type Settings } from "./types";

export type ReaderVars = CSSProperties & Record<string, string>;

/** CSS custom properties consumed by `.reader-prose` in globals.css. */
export function readerStyle(settings: Settings): ReaderVars {
  return {
    "--reader-size": TEXT_SIZE_SCALE[settings.textSize] ?? TEXT_SIZE_SCALE[1],
    "--reader-leading": String(settings.lineHeight),
    "--reader-measure": `${MEASURE_CH[settings.measure]}ch`,
    "--reader-font":
      settings.fontChoice === "serif" ? "var(--font-reading)" : "var(--font-ui)",
  };
}

/** Splits long prose into sentence-sized utterances for speech synthesis. */
export function speechChunks(text: string, limit = 220): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length === 0) return [];
  if (clean.length <= limit) return [clean];

  const sentences = clean.match(/[^.!?…]+[.!?…]+["”']?|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length > limit && current) {
      chunks.push(current.trim());
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** BCP-47 prefixes checked against available speech voices. */
export const SPEECH_LANG: Record<string, string> = {
  id: "id",
  en: "en",
  jv: "jv",
  su: "su",
};
