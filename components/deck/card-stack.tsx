"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "@/components/card/article-card";
import { SwipeCard, type SwipeCardHandle } from "@/components/deck/swipe-card";
import type { Card, Theme } from "@/lib/types";
import type { SwipeDirection } from "@/components/deck/swipe-card";
import type { RefObject } from "react";

type CardStackProps = {
  cards: Card[];
  theme: Theme;
  topRef: RefObject<SwipeCardHandle | null>;
  onAction: (direction: SwipeDirection) => void;
  onOpen: () => void;
  onHide: () => void;
};

const REST = [
  { scale: 1, y: 0 },
  { scale: 0.96, y: 12 },
  { scale: 0.92, y: 24 },
];

export function CardStack({
  cards,
  theme,
  topRef,
  onAction,
  onOpen,
  onHide,
}: CardStackProps): React.ReactElement {
  return (
    <div className="relative h-full w-full">
      {cards.map((card, index) => {
        const isTop = index === 0;
        const rest = REST[Math.min(index, REST.length - 1)];
        return (
          <motion.div
            key={card.pageId}
            initial={false}
            animate={{ scale: rest.scale, y: rest.y, opacity: 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            style={{ zIndex: 10 - index }}
            className="absolute inset-0"
            aria-hidden={isTop ? undefined : true}
          >
            {isTop ? (
              <SwipeCard
                ref={topRef}
                card={card}
                theme={theme}
                priority
                onAction={onAction}
                onOpen={onOpen}
                onHide={onHide}
              />
            ) : (
              <div className="h-full w-full">
                <ArticleCard card={card} theme={theme} showMenu={false} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
