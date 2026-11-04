import Link from "next/link";
import { COPY } from "@/lib/copy";

type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
  className?: string;
};

const SIZE = {
  sm: "text-[1.375rem]",
  md: "text-[1.75rem]",
  lg: "text-[2.5rem]",
} as const;

export function Wordmark({ size = "md", asLink = true, className = "" }: WordmarkProps) {
  const content = (
    <span
      className={`font-display italic leading-none tracking-[-0.01em] ${SIZE[size]} ${className}`}
    >
      {COPY.wordmark}
      <span aria-hidden="true" className="text-primary">
        .
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      aria-label={`${COPY.wordmark} — ${COPY.nav.jelajah}`}
      className="inline-flex items-baseline rounded-sm"
    >
      {content}
    </Link>
  );
}
