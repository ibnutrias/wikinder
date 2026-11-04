"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardMenu } from "@/components/card/card-menu";
import { TypographicCover } from "@/components/card/typographic-cover";
import { COPY } from "@/lib/copy";
import { LANG_LABEL } from "@/lib/wikipedia";
import type { Card, Theme } from "@/lib/types";

type ArticleCardProps = {
  card: Card;
  theme: Theme;
  priority?: boolean;
  showMenu?: boolean;
  onOpen?: () => void;
  onHide?: () => void;
};

/**
 * The swipeable article surface. It is a floating layer, so it carries a shadow
 * and no border (see DESIGN.md).
 */
export function ArticleCard({
  card,
  theme,
  priority = false,
  showMenu = true,
  onOpen,
  onHide,
}: ArticleCardProps): React.ReactElement {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.thumbnail) && !imageFailed;

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-box)] bg-base-200 shadow-float">
      <div className="relative h-[42%] min-h-28 w-full shrink-0 overflow-hidden bg-base-300">
        {showImage && card.thumbnail ? (
          <Image
            src={card.thumbnail.src}
            alt=""
            fill
            sizes="(max-width: 520px) 100vw, 480px"
            priority={priority}
            unoptimized
            onError={() => setImageFailed(true)}
            className="object-cover"
          />
        ) : (
          <TypographicCover title={card.title} theme={theme} />
        )}

        <p className="absolute left-3 top-3 rounded-[var(--radius-selector)] bg-base-100 px-2 py-1 t-12 font-medium text-base-content">
          {LANG_LABEL[card.lang]}
        </p>

        {showMenu ? (
          <div className="absolute right-3 top-3" data-no-drag>
            <CardMenu card={card} onHide={onHide} />
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-5">
        <h2 className="line-clamp-3 shrink-0 t-28" lang={card.lang}>
          {card.title}
        </h2>

        <p className="line-clamp-5 shrink-0 font-reading t-18 text-muted" lang={card.lang}>
          {card.extract}
        </p>

        {onOpen ? (
          <button
            type="button"
            data-no-drag
            onClick={onOpen}
            className="mt-auto flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-[var(--radius-field)] px-1 t-14 font-semibold text-primary hover:underline hover:underline-offset-4"
          >
            {COPY.deck.bacaArtikel}
            <ArrowRight aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
