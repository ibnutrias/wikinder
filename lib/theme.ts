import type { MotionPreference, Theme, ThemeChoice } from "./types";

/** Resolves the stored theme choice against the operating-system preference. */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): Theme {
  if (choice === "system") return prefersDark ? "gelap" : "terang";
  return choice;
}

/** True when the user asked for less motion, explicitly or via the OS. */
export function prefersReducedMotion(preference: MotionPreference, systemReduced: boolean): boolean {
  if (preference === "reduce") return true;
  if (preference === "full") return false;
  return systemReduced;
}
