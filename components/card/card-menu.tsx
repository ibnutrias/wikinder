"use client";

import { ExternalLink, EyeOff, Share2 } from "lucide-react";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { COPY } from "@/lib/copy";
import { showToast } from "@/lib/toast";
import type { Card } from "@/lib/types";

type CardMenuProps = {
  card: Card;
  onHide?: () => void;
};

export function CardMenu({ card, onHide }: CardMenuProps): React.ReactElement {
  const share = async (): Promise<void> => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: card.title, url: card.url });
        return;
      }
      await navigator.clipboard.writeText(card.url);
      showToast({ message: COPY.deck.bagikanTersalin });
    } catch {
      // Share sheet dismissed or clipboard denied; nothing useful to report.
    }
  };

  const items: MenuItem[] = [
    { label: COPY.deck.bagikan, icon: Share2, onSelect: () => void share() },
    { label: COPY.deck.bukaWikipedia, icon: ExternalLink, href: card.url },
  ];

  if (onHide) {
    items.push({
      label: COPY.deck.sembunyikan,
      icon: EyeOff,
      onSelect: onHide,
      tone: "danger",
    });
  }

  return <Menu label={COPY.deck.menu} items={items} />;
}
