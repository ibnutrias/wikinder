"use client";

export type SegmentedOption = {
  value: string;
  label: string;
};

type SegmentedProps = {
  label: string;
  options: readonly SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

/** Radio group styled as a segmented control (daisyUI `join`, hand-rolled). */
export function Segmented({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  size = "md",
}: SegmentedProps): React.ReactElement {
  const height = size === "lg" ? "min-h-12" : "min-h-11";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex rounded-[var(--radius-field)] border border-hairline bg-base-200 p-0.5 ${
        fullWidth ? "flex w-full" : ""
      }`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`${height} flex flex-1 items-center justify-center rounded-[var(--radius-selector)] px-3 t-14 transition-colors duration-[var(--duration-fast)] ${
              selected
                ? "bg-base-300 font-semibold text-base-content"
                : "font-medium text-muted hover:text-base-content"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
