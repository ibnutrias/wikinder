"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SPEECH_LANG } from "./reader-style";
import type { Lang } from "./types";

export type SpeechStatus = "idle" | "playing" | "paused";

export type SpeechParagraph = { id: string; text: string };

type UseSpeechResult = {
  supported: boolean;
  status: SpeechStatus;
  /** id of the paragraph currently being spoken, `null` between chunks. */
  activeId: string | null;
  error: "unsupported" | "no_voice" | null;
  rate: number;
  setRate: (rate: number) => void;
  start: (paragraphs: SpeechParagraph[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const CHUNK_TARGET = 220;

function subscribeToNothing(): () => void {
  return () => {};
}

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+[.!?…]+["”']?|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (`${current} ${sentence}`.trim().length > CHUNK_TARGET && current) {
      chunks.push(current.trim());
      current = sentence.trim();
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Speech synthesis wrapper: one short utterance per sentence so browsers that
 * stall on long utterances keep moving, and a hard `cancel()` on unmount.
 */
export function useSpeech(lang: Lang, initialRate: number): UseSpeechResult {
  const supported = useSyncExternalStore(
    subscribeToNothing,
    () => "speechSynthesis" in window,
    () => false,
  );
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<UseSpeechResult["error"]>(null);
  const [rate, setRateState] = useState(initialRate);
  const queueRef = useRef<{ id: string; text: string }[]>([]);
  const indexRef = useRef(0);
  const cancelledRef = useRef(false);
  const rateRef = useRef(initialRate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const speakNextRef = useRef<() => void>(() => {});

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    queueRef.current = [];
    indexRef.current = 0;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
    setActiveId(null);
  }, []);

  const speakNext = useCallback(() => {
    if (cancelledRef.current) return;
    const queue = queueRef.current;
    const current = queue[indexRef.current];
    if (!current) {
      setStatus("idle");
      setActiveId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang =
      lang === "id" ? "id-ID" : lang === "en" ? "en-US" : lang === "jv" ? "jv-ID" : "su-ID";
    utterance.rate = rateRef.current;

    const voices = window.speechSynthesis.getVoices();
    const prefix = SPEECH_LANG[lang] ?? lang;
    const voice =
      voices.find((candidate) => candidate.lang.toLowerCase().startsWith(prefix)) ?? null;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      indexRef.current += 1;
      setActiveId(null);
      speakNextRef.current();
    };
    utterance.onerror = () => {
      if (cancelledRef.current) return;
      setStatus("idle");
      setActiveId(null);
    };

    setActiveId(current.id);
    setStatus("playing");
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  useEffect(() => {
    speakNextRef.current = speakNext;
  }, [speakNext]);

  const start = useCallback(
    (paragraphs: SpeechParagraph[]) => {
      if (!("speechSynthesis" in window)) {
        setError("unsupported");
        return;
      }
      const voices = window.speechSynthesis.getVoices();
      const prefix = SPEECH_LANG[lang] ?? lang;
      const hasVoice = voices.some((voice) => voice.lang.toLowerCase().startsWith(prefix));
      if (voices.length > 0 && !hasVoice) {
        setError("no_voice");
        return;
      }

      window.speechSynthesis.cancel();
      setError(null);
      cancelledRef.current = false;
      indexRef.current = 0;
      queueRef.current = paragraphs.flatMap((paragraph) =>
        chunkText(paragraph.text).map((text) => ({ id: paragraph.id, text })),
      );
      speakNext();
    },
    [lang, speakNext],
  );

  const pause = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  }, []);

  const setRate = useCallback((next: number) => {
    const clamped = Math.min(1.5, Math.max(0.8, Math.round(next * 10) / 10));
    setRateState(clamped);
  }, []);

  // Cancel when the tab is hidden, on navigation and on unmount.
  useEffect(() => {
    const onVisibility = (): void => {
      if (document.visibilityState === "hidden") cancel();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", cancel);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", cancel);
      cancel();
    };
  }, [cancel]);

  return { supported, status, activeId, error, rate, setRate, start, pause, resume, stop: cancel };
}
