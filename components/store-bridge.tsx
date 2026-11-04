"use client";

import { useEffect } from "react";
import { hydrateStore, useSettings } from "@/lib/store";
import { resolveTheme } from "@/lib/theme";

/**
 * Loads persisted settings after hydration and mirrors them onto `<html>`:
 * the resolved theme and the motion preference. Renders nothing.
 */
export function StoreBridge(): null {
  const { theme, motion } = useSettings();

  useEffect(() => {
    hydrateStore();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (): void => {
      document.documentElement.setAttribute("data-theme", resolveTheme(theme, query.matches));
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", motion);
  }, [motion]);

  return null;
}
