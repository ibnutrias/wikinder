import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps): React.ReactElement {
  return (
    <div className="rounded-[var(--radius-box)] border border-dashed border-hairline bg-base-200 px-6 py-10 sm:px-8">
      <h2 className="t-22">{title}</h2>
      <p className="mt-2 max-w-[44ch] t-16 text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({ title, message, action }: ErrorStateProps): React.ReactElement {
  return (
    <div
      role="alert"
      className="flex flex-col items-start rounded-[var(--radius-box)] border border-hairline bg-base-200 px-6 py-10 sm:px-8"
    >
      <h2 className="t-22">{title}</h2>
      <p className="mt-2 max-w-[44ch] t-16 text-muted">{message}</p>
      {action ? <div className="mt-5 flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

type SkeletonProps = {
  lines?: number;
  className?: string;
};

export function Skeleton({ lines = 3, className = "" }: SkeletonProps): React.ReactElement {
  return (
    <div aria-hidden="true" className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="h-4 rounded-[var(--radius-selector)] bg-base-300"
          style={{ width: index === lines - 1 ? "62%" : index === 0 ? "88%" : "100%" }}
        />
      ))}
    </div>
  );
}
