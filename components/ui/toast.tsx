"use client";

import { useEffect } from "react";
import { dismissToast, useToastState } from "@/lib/toast";

const DURATION_MS = 4200;

/** Single global toast surface, mounted once by the root layout. */
export function ToastViewport(): React.ReactElement | null {
  const toast = useToastState();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] z-[70] flex justify-center px-4 md:bottom-6"
    >
      <div
        key={toast.id}
        className="pointer-events-auto flex min-h-12 items-center gap-3 rounded-[var(--radius-field)] bg-neutral px-4 py-2 text-neutral-content shadow-float motion-safe:animate-[toast-in_var(--duration-base)_var(--ease-out-strong)]"
        style={{ maxWidth: "min(28rem, 100%)" }}
      >
        <span className="t-14 font-medium">{toast.message}</span>
        {toast.onUndo ? (
          <button
            type="button"
            onClick={() => {
              toast.onUndo?.();
              dismissToast();
            }}
            className="ml-auto shrink-0 rounded-[var(--radius-selector)] px-3 py-2 t-14 font-semibold underline underline-offset-2"
          >
            {toast.undoLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
