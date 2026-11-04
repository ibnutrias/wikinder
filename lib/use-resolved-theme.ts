"use client";

import { useSyncExternalStore } from "react";
import { useSettings } from "./store";
import { resolveTheme } from "./theme";
import type { Theme } from "./types";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * The theme actually painted on screen. The OS preference is read through an
 * external store, so the first client render matches the server exactly.
 */
export function useResolvedTheme(): Theme {
  const { theme } = useSettings();
  const prefersDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return resolveTheme(theme, prefersDark);
}
