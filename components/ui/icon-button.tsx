import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Required: icon-only controls must be named for assistive tech. */
  label: string;
  children: ReactNode;
  tone?: "default" | "ghost" | "danger";
  size?: "sm" | "md";
};

const TONE = {
  default: "border border-hairline bg-base-200 text-base-content hover:bg-base-300",
  ghost: "text-base-content hover:bg-base-200",
  danger: "text-error hover:bg-error/10",
} as const;

export function IconButton({
  label,
  children,
  tone = "default",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: IconButtonProps): React.ReactElement {
  const dimension = size === "md" ? "size-11" : "size-9";
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex ${dimension} shrink-0 items-center justify-center rounded-[var(--radius-selector)] ${TONE[tone]} transition-colors duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
