"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookmarkCheck, Trash2 } from "lucide-react";
import { TypographicCover } from "@/components/card/typographic-cover";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { COPY } from "@/lib/copy";
import { formatSavedDate } from "@/lib/format";
import type { CollectionItem, Theme } from "@/lib/types";

type CollectionCardProps = {
  item: CollectionItem;
  theme: Theme;
  onToggleStatus: (item: CollectionItem) => void;
  onRemove: (item: CollectionItem) => void;
};

export function CollectionCard({
  item,
  theme,
  onToggleStatus,
  onRemove,
}: CollectionCardProps): React.ReactElement {
  const { card, status, savedAt } = item;
  const [imageFailed, setImageFailed] = useState(false);

  const items: MenuItem[] = [
    {
      label: status === "want" ? COPY.koleksi.tandaiSelesai : COPY.koleksi.tandaiIngin,
      icon: BookmarkCheck,
      onSelect: () => onToggleStatus(item),
    },
    {
      label: COPY.koleksi.hapus,
      icon: Trash2,
      onSelect: () => onRemove(item),
      tone: "danger",
    },
  ];

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-field)] border border-hairline bg-base-300">
        <Link href={`/read/${card.lang}/${card.pageId}`} className="block h-full w-full">
          {card.thumbnail && !imageFailed ? (
            <Image
              src={card.thumbnail.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
              onError={() => setImageFailed(true)}
              className="object-cover"
            />
          ) : (
            <TypographicCover title={card.title} theme={theme} />
          )}
        </Link>

        {status === "read" ? (
          <span className="absolute bottom-2 left-2 rounded-[var(--radius-selector)] bg-base-100 px-2 py-1 t-12 font-medium text-success">
            {COPY.reader.sudahDibaca}
          </span>
        ) : null}

        <div className="absolute right-2 top-2 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <Menu label={COPY.koleksi.menu} items={items} />
        </div>
      </div>

      <Link href={`/read/${card.lang}/${card.pageId}`} className="mt-3 block">
        <h2 className="line-clamp-2 t-18 font-semibold" lang={card.lang}>
          {card.title}
        </h2>
        <p className="mt-1 t-12 text-muted">
          {COPY.koleksi.tersimpanPada} {formatSavedDate(savedAt)}
        </p>
      </Link>
    </article>
  );
}
