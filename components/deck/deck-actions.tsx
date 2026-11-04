"use client";

import { BookOpen, Bookmark, Undo2, X } from "lucide-react";
import { COPY } from "@/lib/copy";

type DeckActionsProps = {
  canUndo: boolean;
  disabled?: boolean;
  onSkip: () => void;
  onSave: () => void;
  onRead: () => void;
  onUndo: () => void;
};

type ActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  testId: string;
};

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  primary = false,
  testId,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex min-w-16 flex-col items-center gap-1.5 disabled:opacity-40"
    >
      <span
        className={`flex items-center justify-center rounded-[var(--radius-box)] transition-colors duration-[var(--duration-fast)] ${
          primary
            ? "size-16 bg-primary text-primary-content hover:bg-primary/88"
            : "size-14 border border-hairline bg-base-200 text-base-content hover:bg-base-300"
        }`}
      >
        {icon}
      </span>
      <span className={`t-12 ${primary ? "font-semibold" : "font-medium text-muted"}`}>
        {label}
      </span>
    </button>
  );
}

export function DeckActions({
  canUndo,
  disabled = false,
  onSkip,
  onSave,
  onRead,
  onUndo,
}: DeckActionsProps): React.ReactElement {
  return (
    <div className="shrink-0 px-4 pb-3 pt-1">
      <div className="mb-1 flex min-h-11 items-center justify-between">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className="flex min-h-11 items-center gap-1.5 rounded-[var(--radius-selector)] px-2 t-14 font-medium text-muted hover:text-base-content disabled:opacity-40"
        >
          <Undo2 aria-hidden="true" size={16} strokeWidth={1.5} />
          {COPY.deck.aksi.urungkan}
        </button>
        <p className="hidden t-12 text-muted sm:block">{COPY.deck.petunjuk}</p>
      </div>

      <div className="flex items-start justify-center gap-5">
        <ActionButton
          label={COPY.deck.aksi.lewati}
          testId="deck-skip"
          onClick={onSkip}
          disabled={disabled}
          icon={<X aria-hidden="true" size={24} strokeWidth={1.5} />}
        />
        <ActionButton
          label={COPY.deck.aksi.simpan}
          testId="deck-save"
          onClick={onSave}
          disabled={disabled}
          primary
          icon={<Bookmark aria-hidden="true" size={24} strokeWidth={1.5} />}
        />
        <ActionButton
          label={COPY.deck.aksi.baca}
          testId="deck-read"
          onClick={onRead}
          disabled={disabled}
          icon={<BookOpen aria-hidden="true" size={24} strokeWidth={1.5} />}
        />
      </div>
    </div>
  );
}
