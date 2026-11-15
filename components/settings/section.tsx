import type { ReactNode } from "react";

type SettingGroupProps = {
  id: string;
  title: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  children: ReactNode;
};

export function SettingGroup({
  id,
  title,
  description,
  onReset,
  resetLabel,
  children,
}: SettingGroupProps): React.ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 pt-10 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <h2 id={`${id}-title`} className="t-22">
            {title}
          </h2>
          {description ? <p className="mt-1 max-w-[52ch] t-14 text-muted">{description}</p> : null}
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-[var(--radius-selector)] px-2 t-14 font-medium text-primary hover:underline hover:underline-offset-4"
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}
