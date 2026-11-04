import Link from "next/link";
import { COPY } from "@/lib/copy";

type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
  className?: string;
};

const SIZE = {
  sm: "t-18",
  md: "t-22",
  lg: "t-28",
} as const;

export function Wordmark({ size = "md", asLink = true, className = "" }: WordmarkProps) {
  const content = (
    <span className={`font-semibold tracking-[-0.02em] ${SIZE[size]} ${className}`}>
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
      aria-label={`${COPY.wordmark}, ${COPY.nav.jelajah}`}
      className="inline-flex items-baseline rounded-[var(--radius-selector)]"
    >
      {content}
    </Link>
  );
}
