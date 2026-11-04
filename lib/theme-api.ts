import { THEMES } from "./theme";
import type { Theme } from "./copy";

interface TokenColor {
  name: string;
  value: string;
}

function parseHex(value: string): { r: number; g: number; b: number } | null {
  const cleaned = value.trim();
  if (!cleaned.startsWith("#")) return null;
  const hex = cleaned.slice(1);
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const toLin = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const fgLin = relativeLuminance(parseHex(fg) ?? { r: 0, g: 0, b: 0 });
  const bgLin = relativeLuminance(parseHex(bg) ?? { r: 0, g: 0, b: 0 });
  if (fgLin == null || bgLin == null) return null;
  const lighter = Math.max(fgLin, bgLin);
  const darker = Math.min(fgLin, bgLin);
  if (darker === lighter) return 1;
  return (lighter + 0.05) / (darker + 0.05);
}

type Pair = {
  fg: string;
  bg: string;
  role: string;
  minRatio: number;
};

const PAIRS: Pair[] = [
  { fg: "text", bg: "base100", role: "body text on surface", minRatio: 4.5 },
  { fg: "text", bg: "base200", role: "body text on secondary surface", minRatio: 4.5 },
  { fg: "secondary", bg: "base100", role: "secondary text on surface", minRatio: 4.5 },
  { fg: "primary", bg: "primaryContent", role: "primary on its button bg", minRatio: 4.5 },
  { fg: "primaryContent", bg: "primary", role: "primary button label on primary", minRatio: 4.5 },
  { fg: "text", bg: "base300", role: "small label on muted surface", minRatio: 4.5 },
  { fg: "base100", bg: "base300", role: "kartu border label on muted surface", minRatio: 3 },
  { fg: "accent", bg: "base100", role: "accent on surface", minRatio: 3 },
  { fg: "white", bg: "primary", role: "icon/label on primary chip", minRatio: 3 },
  { fg: "text", bg: "card", role: "card text on card", minRatio: 4.5 },
  { fg: "primary", bg: "base100", role: "hover/link accent on surface", minRatio: 3 },
  { fg: "info", bg: "base100", role: "info accent on surface", minRatio: 3 },
  { fg: "success", bg: "base100", role: "success accent on surface", minRatio: 3 },
  { fg: "warning", bg: "base100", role: "warning accent on surface", minRatio: 3 },
  { fg: "error", bg: "base100", role: "error accent on surface", minRatio: 3 },
];

function literal(fg: string, bg: string, tokens: Record<string, string>): {
  fg: string;
  bg: string;
} {
  const resolve = (name: string): string => {
    if (name === "white") return "#FFFFFF";
    const value = tokens[name];
    if (!value) throw new Error(`Missing token ${name}`);
    return value;
  };
  return { fg: resolve(fg), bg: resolve(bg) };
}

function runTheme(themeName: Theme): { ok: boolean; results: string[] } {
  const tokens = THEMES[themeName];
  if (!tokens) {
    return { ok: false, results: [`Missing theme: ${themeName}`] };
  }
  const results: string[] = [];
  let anyFail = false;
  for (const pair of PAIRS) {
    const { fg, bg } = literal(pair.fg, pair.bg, tokens);
    const ratio = contrastRatio(fg, bg);
    if (ratio == null) {
      results.push(`[?] ${themeName} · ${pair.role} · fg=${fg} bg=${bg}`);
      anyFail = true;
      continue;
    }
    const threshold = pair.minRatio;
    const pass = ratio >= threshold - 1e-6;
    const line = `${pass ? "OK " : "FAIL"} ${themeName} · ${pair.role.padEnd(34)} ratio=${ratio.toFixed(2)} (min ${threshold.toFixed(1)}) ${pair.fg} on ${pair.bg}`;
    results.push(line);
    if (!pass) anyFail = true;
  }
  return { ok: !anyFail, results };
}

function main() {
  const themes: Theme[] = ["kertas", "malam", "sepia", "kontras"];
  let overallOk = true;
  for (const theme of themes) {
    const { ok, results } = runTheme(theme);
    console.log(`\n=== ${theme} ===`);
    for (const line of results) console.log(line);
    if (!ok) overallOk = false;
  }
  console.log("");
  if (overallOk) {
    console.log("All contrast pairs pass WCAG AA thresholds.");
    process.exit(0);
  } else {
    console.error("Some contrast pairs FAIL. Adjust tokens in lib/theme.ts.");
    process.exit(1);
  }
}

main();
