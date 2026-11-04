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

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  block?: boolean;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type LinkButtonProps = CommonProps & {
  href: string;
  external?: boolean;
  "aria-label"?: string;
};

function isLinkButton(props: ButtonProps | LinkButtonProps): props is LinkButtonProps {
  return typeof (props as LinkButtonProps).href === "string";
}

export function Button(props: ButtonProps | LinkButtonProps): React.ReactElement {
  const { children, variant = "secondary", size = "md", className = "", block } = props;
  const classes = buttonClass(variant, size, `${block ? "w-full" : ""} ${className}`);

  if (isLinkButton(props)) {
    const { href, external, "aria-label": ariaLabel } = props;
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

  const { ...rest } = props;
  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
