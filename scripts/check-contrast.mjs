#!/usr/bin/env node
/**
 * Reports WCAG 2.x contrast for every colour pair Wikinder renders, reading the
 * theme definitions straight from app/globals.css. Exits non-zero on failure so
 * it can gate a build.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "app", "globals.css"), "utf8");

const themePattern = /@plugin\s+"daisyui\/theme"\s*\{([\s\S]*?)\}/g;
const rules = [
  ["--color-base-content", "--color-base-100", "body on page", 4.5],
  ["--color-base-content", "--color-base-200", "body on raised", 4.5],
  ["--color-base-content", "--color-base-300", "body on muted", 4.5],
  ["--muted", "--color-base-100", "secondary on page", 4.5],
  ["--muted", "--color-base-200", "secondary on raised", 4.5],
  ["--color-primary-content", "--color-primary", "label on primary", 4.5],
  ["--color-primary", "--color-base-100", "primary text", 4.5],
  ["--color-secondary-content", "--color-secondary", "label on secondary", 4.5],
  ["--color-neutral-content", "--color-neutral", "label on neutral", 4.5],
  ["--color-accent", "--color-base-100", "accent text", 4.5],
  ["--color-info", "--color-base-100", "info text", 4.5],
  ["--color-success", "--color-base-100", "success text", 4.5],
  ["--color-warning", "--color-base-100", "warning text", 4.5],
  ["--color-error", "--color-base-100", "error text", 4.5],
  ["--stamp", "--color-base-100", "stamp on card", 3],
];

function hexToRgb(hex) {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const body = hex.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((c) => c + c)
          .join("")
      : body;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function luminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg, bg) {
  const a = luminance(hexToRgb(fg));
  const b = luminance(hexToRgb(bg));
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

let failures = 0;
let checked = 0;

for (const block of css.matchAll(themePattern)) {
  const body = block[1];
  const name = /name:\s*"([^"]+)"/.exec(body)?.[1] ?? "unknown";
  const tokens = new Map();
  for (const decl of body.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{3,6})\s*;/gi)) {
    tokens.set(decl[1], decl[2]);
  }

  console.log(`\n${name}`);
  for (const [fgVar, bgVar, label, minimum] of rules) {
    const fg = tokens.get(fgVar);
    const bg = tokens.get(bgVar);
    if (!fg || !bg) {
      console.log(`  ?? ${label}: missing ${fg ?? fgVar} / ${bg ?? bgVar}`);
      failures += 1;
      continue;
    }
    const value = ratio(fg, bg);
    checked += 1;
    const ok = value >= minimum;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "OK  " : "FAIL"} ${label.padEnd(20)} ${value.toFixed(2)} (min ${minimum})`,
    );
  }
}

console.log(`\n${checked} pairs checked, ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
