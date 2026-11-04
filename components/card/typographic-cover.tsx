import { coverFor, coverMonogram } from "@/lib/cover";
import type { Theme } from "@/lib/types";

type TypographicCoverProps = {
  title: string;
  theme: Theme;
};

/**
 * Cover for articles without a photograph: the title's monogram over a
 * two-colour surface drawn from the active theme.
 */
export function TypographicCover({ title, theme }: TypographicCoverProps) {
  const palette = coverFor(title, theme);

  return (
    <div
      data-testid="typographic-cover"
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: palette.background, color: palette.foreground }}
    >
      <span className="cover-monogram font-semibold select-none">
        {coverMonogram(title)}
      </span>
    </div>
  );
}
