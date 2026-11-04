"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Copy, Trash2, X } from "lucide-react";
import { AppearanceControls } from "@/components/reader/appearance-controls";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { copyText } from "@/lib/clipboard";
import { COPY } from "@/lib/copy";
import { showToast } from "@/lib/toast";
import type { FullArticle } from "@/lib/wikipedia";

export function DisplaySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={COPY.reader.tampilan}>
      <AppearanceControls />
    </Sheet>
  );
}

export function CiteSheet({
  open,
  onClose,
  article,
  langLabel,
}: {
  open: boolean;
  onClose: () => void;
  article: FullArticle;
  langLabel: string;
}) {
  const host = new URL(article.url).host;
  const base = {
    title: article.title,
    pageId: article.pageId,
    langCode: article.lang,
    langLabel,
    host,
    accessedAt: new Date(),
  };

  const copy = async (kind: "plain" | "apa"): Promise<void> => {
    const { formatPlainCitation, formatApaCitation } = await import("@/lib/citation");
    const text = kind === "plain" ? formatPlainCitation(base) : formatApaCitation(base);
    const ok = await copyText(text);
    showToast({
      message: ok ? COPY.reader.sitasiTersalin : COPY.reader.sitasiGagal,
      tone: ok ? "success" : "error",
    });
    if (ok) onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={COPY.reader.sitasiJudul}
      description={COPY.reader.lisensi}
    >
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={() => void copy("plain")} block>
          <Copy aria-hidden="true" size={20} strokeWidth={1.5} />
          {COPY.reader.sitasiTeks}
        </Button>
        <Button variant="secondary" onClick={() => void copy("apa")} block>
          <Copy aria-hidden="true" size={20} strokeWidth={1.5} />
          {COPY.reader.sitasiApa}
        </Button>
      </div>
    </Sheet>
  );
}

export type HighlightEntry = {
  key: string;
  sectionTitle: string;
  text: string;
};

export function HighlightsSheet({
  open,
  onClose,
  entries,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  entries: HighlightEntry[];
  onRemove: (key: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={COPY.reader.sorotan}>
      {entries.length === 0 ? (
        <p className="t-16 text-muted">{COPY.reader.sorotanKosong}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.key} className="rounded-[var(--radius-field)] border border-hairline p-3">
              <p className="t-12 font-semibold text-muted">{entry.sectionTitle}</p>
              <p className="mt-1 t-14">{entry.text}</p>
              <button
                type="button"
                onClick={() => onRemove(entry.key)}
                className="mt-2 flex min-h-11 items-center gap-1.5 t-14 font-medium text-error"
              >
                <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
                {COPY.reader.hapusSorotan}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

export function ShortcutsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={COPY.reader.pintasan}>
      <dl className="divide-y divide-hairline">
        {COPY.reader.pintasanDaftar.map((item) => (
          <div key={item.kunci} className="flex items-center justify-between gap-4 py-3">
            <dt className="t-14">{item.aksi}</dt>
            <dd>
              <kbd className="rounded-[var(--radius-selector)] border border-hairline bg-base-200 px-2 py-1 t-12 font-medium">
                {item.kunci}
              </kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Sheet>
  );
}

export function ImageDialog({
  open,
  onClose,
  article,
}: {
  open: boolean;
  onClose: () => void;
  article: FullArticle;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={COPY.reader.gambarArtikel}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-black/90 p-0 backdrop:bg-black/80"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex justify-end p-3" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label={COPY.umum.tutup}
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-selector)] bg-white/10 text-white hover:bg-white/20"
          >
            <X aria-hidden="true" size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="relative flex-1">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail.src}
              alt={article.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
