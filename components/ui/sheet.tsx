"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { COPY } from "@/lib/copy";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "default" | "wide";
};

/**
 * Bottom sheet on phones, centred dialog from `sm` up. Built on `<dialog>` so
 * focus trapping, Esc and the inert background come from the platform.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
}: SheetProps): React.ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock the page without the classic scrollbar-shift jump.
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  const titleId = `sheet-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/45"
    >
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[var(--radius-box)] bg-base-100 shadow-sheet sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-box)] ${
          size === "wide" ? "sm:w-[min(640px,calc(100vw-2rem))]" : "sm:w-[min(520px,calc(100vw-2rem))]"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div>
            <h2 id={titleId} className="t-18 font-semibold">
              {title}
            </h2>
            {description ? <p className="mt-1 t-14 text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={COPY.umum.tutup}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-selector)] text-base-content hover:bg-base-200"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-hairline px-5 py-4">{footer}</footer>
        ) : null}
      </div>
    </dialog>
  );
}
