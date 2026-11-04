"use client";

import { useMemo, useState } from "react";
import { CollectionCard } from "@/components/collection/collection-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { COPY } from "@/lib/copy";
import {
  removeCard,
  setCardStatus,
  useCollection,
  useHydrated,
} from "@/lib/store";
import { showToast } from "@/lib/toast";
import { useResolvedTheme } from "@/lib/use-resolved-theme";
import type { CollectionItem, CollectionStatus } from "@/lib/types";

type Tab = CollectionStatus;

export function CollectionView(): React.ReactElement {
  const collection = useCollection();
  const hydrated = useHydrated();
  const theme = useResolvedTheme();
  const [tab, setTab] = useState<Tab>("want");

  const want = useMemo(() => collection.filter((item) => item.status === "want"), [collection]);
  const read = useMemo(() => collection.filter((item) => item.status === "read"), [collection]);
  const visible = tab === "want" ? want : read;

  const toggleStatus = (item: CollectionItem): void => {
    const next = item.status === "want" ? "read" : "want";
    setCardStatus(item.card.pageId, next);
    if (next === "read") showToast({ message: COPY.reader.ditandaiSelesai });
  };

  const remove = (item: CollectionItem): void => {
    removeCard(item.card.pageId);
    showToast({ message: COPY.koleksi.dihapus });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <PageHeader title={COPY.koleksi.judul} description={COPY.koleksi.subjudul} />

      <div className="mt-5 flex gap-1 border-b border-hairline">
        {(
          [
            { id: "want" as const, label: COPY.koleksi.tabIngin, count: want.length },
            { id: "read" as const, label: COPY.koleksi.tabSudah, count: read.length },
          ]
        ).map((entry) => {
          const selected = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={`tab-${entry.id}`}
              aria-selected={selected}
              aria-controls={`panel-${entry.id}`}
              onClick={() => setTab(entry.id)}
              className={`-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 t-14 ${
                selected
                  ? "border-primary font-semibold text-base-content"
                  : "border-transparent font-medium text-muted hover:text-base-content"
              }`}
            >
              {entry.label}
              <span className="tabular rounded-[var(--radius-selector)] bg-base-300 px-1.5 text-base-content">
                {entry.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="aspect-[4/3] animate-pulse rounded-[var(--radius-field)] bg-base-300"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={tab === "want" ? COPY.koleksi.kosongInginJudul : COPY.koleksi.kosongSudahJudul}
            message={tab === "want" ? COPY.koleksi.kosongInginPesan : COPY.koleksi.kosongSudahPesan}
            action={
              tab === "want" ? (
                <Button href="/" variant="primary">
                  {COPY.koleksi.mulaiJelajah}
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => (
              <li key={item.card.pageId}>
                <CollectionCard
                  item={item}
                  theme={theme}
                  onToggleStatus={toggleStatus}
                  onRemove={remove}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
