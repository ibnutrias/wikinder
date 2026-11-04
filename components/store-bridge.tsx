"use client";

import { useEffect } from "react";
import { hydrateStore, useSettings } from "@/lib/store";

/**
 * Loads persisted settings after hydration and keeps `<html data-theme>` in
 * sync with them. Renders nothing.
 */
export function StoreBridge(): null {
  const { theme } = useSettings();

  useEffect(() => {
    hydrateStore();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}
