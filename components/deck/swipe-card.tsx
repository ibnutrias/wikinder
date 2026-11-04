"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ArticleCard } from "@/components/card/article-card";
import { SwipeHint } from "@/components/deck/rubber-stamp";
import { COPY } from "@/lib/copy";
import type { Card, Theme } from "@/lib/types";

const DISTANCE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 620;
const SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;

export type SwipeDirection = "save" | "skip";

export type SwipeCardHandle = {
  fling: (direction: SwipeDirection) => void;
};

type SwipeCardProps = {
  card: Card;
  theme: Theme;
  priority?: boolean;
  onAction: (direction: SwipeDirection) => void;
  onOpen: () => void;
  onHide: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard(
  { card, theme, priority, onAction, onOpen, onHide },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const busy = useRef(false);

  const rotate = useTransform(x, [-280, 0, 280], [-8, 0, 8]);
  const skipOpacity = useTransform(x, [-160, -40], [1, 0]);
  const saveOpacity = useTransform(x, [40, 160], [0, 1]);

  const fling = useCallback(
    (direction: SwipeDirection): void => {
      if (busy.current) return;
      busy.current = true;

      if (reduceMotion) {
        animate(opacity, 0, {
          duration: 0.12,
          onComplete: () => onAction(direction),
        });
        return;
      }

      animate(x, direction === "save" ? 560 : -560, {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => onAction(direction),
      });
    },
    [onAction, opacity, reduceMotion, x],
  );

  useImperativeHandle(ref, () => ({ fling }), [fling]);

  const handleDragEnd = (_event: unknown, info: PanInfo): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > DISTANCE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      fling("save");
      return;
    }
    if (offset < -DISTANCE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
      fling("skip");
      return;
    }
    animate(x, 0, SPRING);
  };

  const handleTap = (): void => {
    if (busy.current) return;
    if (Math.abs(x.get()) > 6) return;
    onOpen();
  };

  return (
    <motion.div
      drag="x"
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0 }}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      style={{ x, rotate, opacity, touchAction: "pan-y" }}
      className="absolute inset-0 cursor-grab outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      role="group"
      aria-label={`${COPY.deck.labelKartu}: ${card.title}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onOpen();
        }
      }}
      onPointerDownCapture={(event: ReactPointerEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-no-drag]")) event.stopPropagation();
      }}
    >
      <ArticleCard
        card={card}
        theme={theme}
        priority={priority}
        onOpen={onOpen}
        onHide={onHide}
      />

      <SwipeHint label={COPY.deck.aksi.simpan} side="right" opacity={saveOpacity} />
      <SwipeHint label={COPY.deck.aksi.lewati} side="left" opacity={skipOpacity} />
    </motion.div>
  );
});
