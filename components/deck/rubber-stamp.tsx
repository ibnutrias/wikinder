"use client";

import { motion, type MotionValue } from "framer-motion";

type SwipeHintProps = {
  label: string;
  side: "left" | "right";
  opacity: MotionValue<number>;
};

/** Directional feedback while a card is dragged. Purely visual. */
export function SwipeHint({ label, side, opacity }: SwipeHintProps): React.ReactElement {
  return (
    <motion.span
      aria-hidden="true"
      style={{ opacity }}
      className={`pointer-events-none absolute top-4 select-none rounded-[var(--radius-selector)] bg-primary px-2.5 py-1 t-12 font-semibold text-primary-content ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      {label}
    </motion.span>
  );
}
