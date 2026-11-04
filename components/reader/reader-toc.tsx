"use client";

import { Sheet } from "@/components/ui/sheet";
import { COPY } from "@/lib/copy";
import type { ArticleSection } from "@/lib/article";

type TocListProps = {
  sections: ArticleSection[];
  activeId: string | null;
  onSelect: (section: ArticleSection) => void;
  variant: "sheet" | "rail";
};

function TocList({ sections, activeId, onSelect, variant }: TocListProps) {
  return (
    <ol className={variant === "rail" ? "space-y-1" : "space-y-0.5"}>
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onSelect(section)}
              aria-current={active ? "location" : undefined}
              className={`flex w-full items-start gap-2 rounded-[var(--radius-selector)] py-2 pr-2 text-left t-14 ${
                variant === "rail" ? "min-h-9 pl-2" : "min-h-11 pl-3"
              } ${active ? "bg-base-200 font-semibold text-primary" : "text-muted hover:text-base-content"}`}
              style={{ paddingLeft: `${(section.level - 2) * 12 + 8}px` }}
            >
              {section.title}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

type TocSheetProps = Omit<TocListProps, "variant"> & {
  open: boolean;
  onClose: () => void;
};

export function TocSheet({ open, onClose, sections, activeId, onSelect }: TocSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={COPY.reader.daftarIsi}>
      {sections.length === 0 ? (
        <p className="t-14 text-muted">{COPY.reader.tanpaSeksi}</p>
      ) : (
        <TocList
          variant="sheet"
          sections={sections}
          activeId={activeId}
          onSelect={onSelect}
        />
      )}
    </Sheet>
  );
}

export function TocRail(props: Omit<TocListProps, "variant">) {
  return (
    <nav aria-label={COPY.reader.daftarIsi} className="sticky top-20">
      <p className="t-12 font-semibold text-muted">{COPY.reader.daftarIsi}</p>
      <div className="mt-2 max-h-[70dvh] overflow-y-auto overscroll-contain border-l border-hairline pl-1">
        <TocList variant="rail" {...props} />
      </div>
    </nav>
  );
}
