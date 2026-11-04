"use client";

import { useId } from "react";

type SwitchRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** One labelled setting row with an accessible switch on the right. */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SwitchRowProps): React.ReactElement {
  const descriptionId = useId();

  return (
    <div className="flex min-h-14 items-start justify-between gap-4 border-b border-hairline py-3 last:border-b-0">
      <div className="min-w-0">
        <span id={`${descriptionId}-label`} className="t-16 font-medium">
          {label}
        </span>
        {description ? (
          <p id={descriptionId} className="mt-0.5 max-w-[46ch] t-14 text-muted">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${descriptionId}-label`}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-[var(--duration-fast)] disabled:opacity-50 ${
          checked ? "border-primary bg-primary" : "border-hairline bg-base-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-5 rounded-full bg-base-100 transition-transform duration-[var(--duration-fast)] ${
            checked ? "left-0.5 translate-x-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
