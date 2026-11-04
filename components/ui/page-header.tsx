import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  id?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  id = "page-title",
}: PageHeaderProps): React.ReactElement {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
      <div className="min-w-0">
        <h1 id={id} className="t-36">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[52ch] t-16 text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
