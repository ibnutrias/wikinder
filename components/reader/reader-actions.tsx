"use client";

import { Bookmark, BookmarkCheck, Check, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { Segmented } from "@/components/ui/segmented";
import { COPY } from "@/lib/copy";
import type { CollectionStatus } from "@/lib/types";
import type { SpeechStatus } from "@/lib/use-speech";

type ReaderActionsProps = {
  status: CollectionStatus | null;
  onPrimary: () => void;
  menuItems: MenuItem[];
  hidden: boolean;
  speech: {
    status: SpeechStatus;
    rate: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onRate: (rate: number) => void;
  } | null;
};

export function ReaderActions({
  status,
  onPrimary,
  menuItems,
  hidden,
  speech,
}: ReaderActionsProps): React.ReactElement {
  const label =
    status === null
      ? COPY.reader.simpan
      : status === "want"
        ? COPY.reader.tandaiSelesai
        : COPY.reader.sudahDibaca;

  return (
    <div
      className={`no-print fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-base-100 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-strong)] ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {speech && speech.status !== "idle" ? (
        <div className="border-b border-hairline px-4 py-2">
          <div className="mx-auto flex max-w-[72ch] flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={speech.status === "paused" ? speech.onResume : speech.onPause}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-selector)] px-2 t-14 font-medium hover:bg-base-200"
            >
              {speech.status === "paused" ? (
                <Play aria-hidden="true" size={20} strokeWidth={1.5} />
              ) : (
                <Pause aria-hidden="true" size={20} strokeWidth={1.5} />
              )}
              {speech.status === "paused" ? COPY.reader.putar : COPY.reader.jeda}
            </button>
            <button
              type="button"
              onClick={speech.onStop}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-selector)] px-2 t-14 font-medium text-muted hover:bg-base-200"
            >
              <Square aria-hidden="true" size={16} strokeWidth={1.5} />
              {COPY.reader.hentikan}
            </button>
            <div className="ml-auto min-w-[12rem]">
              <Segmented
                label={COPY.reader.kecepatan}
                value={String(speech.rate)}
                onChange={(value) => speech.onRate(Number(value))}
                options={[
                  { value: "0.8", label: "0.8×" },
                  { value: "1", label: "1×" },
                  { value: "1.25", label: "1.25×" },
                  { value: "1.5", label: "1.5×" },
                ]}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[72ch] items-center gap-2 px-4 py-2.5">
        <Button
          variant={status === "read" ? "secondary" : "primary"}
          size="lg"
          block
          onClick={onPrimary}
          disabled={status === "read"}
          aria-label={label}
        >
          {status === "read" ? (
            <Check aria-hidden="true" size={20} strokeWidth={1.5} />
          ) : status === "want" ? (
            <BookmarkCheck aria-hidden="true" size={20} strokeWidth={1.5} />
          ) : (
            <Bookmark aria-hidden="true" size={20} strokeWidth={1.5} />
          )}
          {label}
        </Button>

        {speech && speech.status === "idle" ? (
          <button
            type="button"
            onClick={speech.onStart}
            aria-label={COPY.reader.bacaNyaring}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-[var(--radius-field)] border border-hairline px-3 t-14 font-medium hover:bg-base-200"
          >
            <Play aria-hidden="true" size={20} strokeWidth={1.5} />
            <span className="hidden sm:inline">{COPY.reader.bacaNyaring}</span>
          </button>
        ) : null}

        <Menu label={COPY.reader.aksiLain} items={menuItems} trigger="icon" />
      </div>
    </div>
  );
}
