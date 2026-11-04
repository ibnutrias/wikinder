"use client";

import { RotateCcw } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { COPY } from "@/lib/copy";
import { readerStyle } from "@/lib/reader-style";
import { resetSettings, updateSettings, useSettings } from "@/lib/store";
import {
  LINE_HEIGHTS,
  TEXT_SIZES,
  THEMES,
  type Measure,
  type Theme,
  type ThemeChoice,
} from "@/lib/types";

const SWATCH: Record<Theme, { paper: string; ink: string }> = {
  terang: { paper: "#F5F6F8", ink: "#14161A" },
  gelap: { paper: "#0F1115", ink: "#E8EAEE" },
  sepia: { paper: "#F1E6CF", ink: "#3A2E1F" },
  kontras: { paper: "#FFFFFF", ink: "#000000" },
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 first:mt-1">
      <h3 className="t-14 font-semibold text-muted">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * One set of appearance controls, shared by the Reader sheet and the Settings
 * page so the two can never drift apart.
 */
export function AppearanceControls({ showPreview = true }: { showPreview?: boolean }) {
  const settings = useSettings();

  const themeOptions: { value: ThemeChoice; label: string }[] = [
    { value: "system", label: COPY.pengaturan.temaNama.system },
    ...THEMES.map((theme) => ({ value: theme as ThemeChoice, label: COPY.pengaturan.temaNama[theme] })),
  ];

  return (
    <div>
      <Group title={COPY.reader.tema}>
        <div role="radiogroup" aria-label={COPY.reader.tema} className="grid grid-cols-5 gap-1.5">
          {themeOptions.map((option) => {
            const selected = settings.theme === option.value;
            const swatch = option.value === "system" ? null : SWATCH[option.value];
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => updateSettings({ theme: option.value })}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[var(--radius-field)] border px-1 t-12 ${
                  selected
                    ? "border-primary font-semibold text-base-content"
                    : "border-hairline text-muted hover:text-base-content"
                }`}
              >
                {swatch ? (
                  <span
                    aria-hidden="true"
                    className="flex size-7 items-center justify-center rounded-full border border-hairline t-12 font-semibold"
                    style={{ backgroundColor: swatch.paper, color: swatch.ink }}
                  >
                    Aa
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="size-7 rounded-full border border-hairline"
                    style={{
                      background:
                        "linear-gradient(90deg, #F5F6F8 0 50%, #0F1115 50% 100%)",
                    }}
                  />
                )}
                {option.label}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={COPY.reader.ukuranTeks}>
        <div role="radiogroup" aria-label={COPY.reader.ukuranTeks} className="flex gap-1.5">
          {TEXT_SIZES.map((size) => {
            const selected = settings.textSize === size;
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={COPY.pengaturan.ukuranNama[size]}
                onClick={() => updateSettings({ textSize: size })}
                className={`flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-field)] border font-reading ${
                  selected
                    ? "border-primary bg-primary text-primary-content"
                    : "border-hairline text-base-content hover:bg-base-200"
                }`}
                style={{ fontSize: `${0.75 + size * 0.1}rem` }}
              >
                A
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={COPY.reader.jenisHuruf}>
        <Segmented
          fullWidth
          label={COPY.reader.jenisHuruf}
          value={settings.fontChoice}
          onChange={(value) =>
            updateSettings({ fontChoice: value === "sans" ? "sans" : "serif" })
          }
          options={[
            { value: "serif", label: COPY.reader.serif },
            { value: "sans", label: COPY.reader.sans },
          ]}
        />
      </Group>

      <Group title={COPY.reader.tinggiBaris}>
        <Segmented
          fullWidth
          label={COPY.reader.tinggiBaris}
          value={String(settings.lineHeight)}
          onChange={(value) => updateSettings({ lineHeight: Number(value) })}
          options={LINE_HEIGHTS.map((height) => ({
            value: String(height),
            label:
              height === 1.5 ? COPY.reader.rapat : height === 1.65 ? COPY.reader.nyaman : COPY.reader.lapang,
          }))}
        />
      </Group>

      <Group title={COPY.reader.lebarBaca}>
        <Segmented
          fullWidth
          label={COPY.reader.lebarBaca}
          value={settings.measure}
          onChange={(value) => updateSettings({ measure: value as Measure })}
          options={[
            { value: "sempit", label: COPY.reader.sempit },
            { value: "normal", label: COPY.reader.normal },
            { value: "lebar", label: COPY.reader.lebar },
          ]}
        />
      </Group>

      {showPreview ? (
        <p
          lang="id"
          className="reader-prose mt-5 rounded-[var(--radius-field)] border border-hairline bg-base-200 px-4 py-3 text-muted"
          style={readerStyle(settings)}
        >
          {COPY.reader.pratinjau}
        </p>
      ) : null}

      <button
        type="button"
        onClick={resetSettings}
        className="mt-5 flex min-h-11 items-center gap-2 rounded-[var(--radius-selector)] t-14 font-medium text-muted hover:text-base-content"
      >
        <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
        {COPY.reader.kembalikan}
      </button>
    </div>
  );
}
