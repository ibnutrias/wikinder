/**
 * Colour maths and theme auditing. Pure functions so both the CLI check and
 * the unit tests read the same rules directly from `app/globals.css`.
 */

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null;
  const body = value.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((char) => char + char)
          .join("")
      : body;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function channelToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ThemeTokens = Record<string, string>;

/** Extracts `@plugin "daisyui/theme" { name: "..."; --color-*: #hex; }` blocks. */
export function parseThemeBlocks(css: string): Record<string, ThemeTokens> {
  const themes: Record<string, ThemeTokens> = {};
  const blockPattern = /@plugin\s+"daisyui\/theme"\s*\{([\s\S]*?)\}/g;

  for (const match of css.matchAll(blockPattern)) {
    const body = match[1];
    const nameMatch = /name:\s*"([^"]+)"/.exec(body);
    if (!nameMatch) continue;
    const tokens: ThemeTokens = {};
    for (const decl of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      const key = decl[1].trim();
      const value = decl[2].trim();
      if (/^#[0-9a-f]{3,6}$/i.test(value)) tokens[key] = value;
    }
    themes[nameMatch[1]] = tokens;
  }
  return themes;
}

export type ContrastRule = {
  foreground: string;
  background: string;
  label: string;
  minimum: number;
};

/**
 * Every text/background pair the interface actually renders. `minimum` is the
 * WCAG 2.x AA threshold for that pairing: 4.5 for body text, 3 for large text,
 * UI glyph borders and non-text accents.
 */
export const CONTRAST_RULES: readonly ContrastRule[] = [
  { foreground: "--color-base-content", background: "--color-base-100", label: "body copy on page", minimum: 4.5 },
  { foreground: "--color-base-content", background: "--color-base-200", label: "body copy on raised surface", minimum: 4.5 },
  { foreground: "--color-base-content", background: "--color-base-300", label: "body copy on muted surface", minimum: 4.5 },
  { foreground: "--muted", background: "--color-base-100", label: "secondary text on page", minimum: 4.5 },
  { foreground: "--muted", background: "--color-base-200", label: "secondary text on raised surface", minimum: 4.5 },
  { foreground: "--color-primary-content", background: "--color-primary", label: "label on primary button", minimum: 4.5 },
  { foreground: "--color-primary", background: "--color-base-100", label: "primary text on page", minimum: 4.5 },
  { foreground: "--color-secondary-content", background: "--color-secondary", label: "label on secondary surface", minimum: 4.5 },
  { foreground: "--color-neutral-content", background: "--color-neutral", label: "label on neutral surface", minimum: 4.5 },
  { foreground: "--color-accent", background: "--color-base-100", label: "accent text on page", minimum: 4.5 },
  { foreground: "--color-info", background: "--color-base-100", label: "info text on page", minimum: 4.5 },
  { foreground: "--color-success", background: "--color-base-100", label: "success text on page", minimum: 4.5 },
  { foreground: "--color-warning", background: "--color-base-100", label: "warning text on page", minimum: 4.5 },
  { foreground: "--color-error", background: "--color-base-100", label: "error text on page", minimum: 4.5 },
  { foreground: "--stamp", background: "--color-base-100", label: "swipe stamp on card", minimum: 3 },
];

export type ContrastResult = {
  theme: string;
  label: string;
  ratio: number;
  minimum: number;
  pass: boolean;
};

export function auditThemes(themes: Record<string, ThemeTokens>): ContrastResult[] {
  const results: ContrastResult[] = [];
  for (const [theme, tokens] of Object.entries(themes)) {
    for (const rule of CONTRAST_RULES) {
      const fg = tokens[rule.foreground];
      const bg = tokens[rule.background];
      const ratio = fg && bg ? contrastRatio(fg, bg) : null;
      results.push({
        theme,
        label: rule.label,
        ratio: ratio ?? 0,
        minimum: rule.minimum,
        pass: ratio !== null && ratio >= rule.minimum,
      });
    }
  }
  return results;
}
