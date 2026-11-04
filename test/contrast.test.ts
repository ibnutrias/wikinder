import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { auditThemes, contrastRatio, hexToRgb, parseThemeBlocks } from "@/lib/contrast";

const CSS = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);
const THEMES = parseThemeBlocks(CSS);

describe("contrast maths", () => {
  it("parses three- and six-digit hex", () => {
    expect(hexToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#FBF8F2")).toEqual({ r: 251, g: 248, b: 242 });
    expect(hexToRgb("not-a-colour")).toBeNull();
  });

  it("scores black on white at 21:1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });
});

describe("theme tokens", () => {
  it("finds all four themes in globals.css", () => {
    expect(Object.keys(THEMES).sort()).toEqual(["kertas", "kontras", "malam", "sepia"]);
  });

  it("defines every token the interface uses", () => {
    for (const [theme, tokens] of Object.entries(THEMES)) {
      for (const token of [
        "--color-base-100",
        "--color-base-200",
        "--color-base-300",
        "--color-base-content",
        "--color-primary",
        "--color-primary-content",
        "--muted",
        "--hairline",
        "--stamp",
      ]) {
        expect(tokens[token], `${theme} is missing ${token}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("meets WCAG AA on every rendered pair", () => {
    const results = auditThemes(THEMES);
    expect(results.length).toBeGreaterThan(0);
    const failures = results
      .filter((result) => !result.pass)
      .map(
        (result) =>
          `${result.theme}: ${result.label} = ${result.ratio.toFixed(2)} < ${result.minimum}`,
      );
    expect(failures).toEqual([]);
  });
});
