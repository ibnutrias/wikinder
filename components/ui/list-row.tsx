import type { ReactNode } from "react";

type ListRowProps = {
  label: string;
  description?: string;
  children: ReactNode;
  align?: "start" | "end";
  htmlFor?: string;
};

/** A settings row: label and help on the left, one control on the right. */
export function ListRow({
  label,
  description,
  children,
  align = "end",
  htmlFor,
}: ListRowProps): React.ReactElement {
  const labelId = `${htmlFor ?? label.replace(/\s+/g, "-").toLowerCase()}-label`;

  return (
    <div
      className={`flex flex-col gap-3 border-b border-hairline py-4 last:border-b-0 sm:flex-row sm:gap-6 ${
        align === "end" ? "sm:items-center sm:justify-between" : "sm:items-start"
      }`}
    >
      <div className="min-w-0 sm:max-w-[26rem]">
        <label id={labelId} htmlFor={htmlFor} className="t-16 font-medium">
          {label}
        </label>
        {description ? <p className="mt-0.5 t-14 text-muted">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
