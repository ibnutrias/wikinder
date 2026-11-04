import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] font-medium transition-colors duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-content hover:bg-primary/88",
  secondary: "border border-hairline bg-base-200 text-base-content hover:bg-base-300",
  ghost: "text-base-content hover:bg-base-200",
  danger: "bg-error text-error-content hover:bg-error/88",
};

const SIZE: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 t-14",
  lg: "min-h-12 px-5 t-16",
};

export function buttonClass(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${extra}`.trim();
}

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. Never forwarded to the DOM. */
  block?: boolean;
  className?: string;
};

type ButtonElementProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

type ButtonLinkProps = SharedProps & {
  href: string;
  external?: boolean;
  "aria-label"?: string;
};

function classesFor({ variant, size, block, className }: SharedProps): string {
  return buttonClass(variant, size, `${block ? "w-full" : ""} ${className ?? ""}`);
}

function ButtonElement({
  children,
  variant = "secondary",
  size = "md",
  block = false,
  className = "",
  ...rest
}: ButtonElementProps) {
  return (
    <button
      type="button"
      {...rest}
      className={classesFor({ variant, size, block, className, children })}
    >
      {children}
    </button>
  );
}

function ButtonLink({
  href,
  external,
  children,
  "aria-label": ariaLabel,
  ...shared
}: ButtonLinkProps) {
  const classes = classesFor({ ...shared, children });
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function isLinkButton(props: ButtonElementProps | ButtonLinkProps): props is ButtonLinkProps {
  return typeof (props as ButtonLinkProps).href === "string";
}

export function Button(props: ButtonElementProps | ButtonLinkProps): React.ReactElement {
  return isLinkButton(props) ? <ButtonLink {...props} /> : <ButtonElement {...props} />;
}
