"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CardStack } from "@/components/deck/card-stack";
import { DeckActions } from "@/components/deck/deck-actions";
import { DeckError, DeckSkeleton } from "@/components/deck/deck-states";
import { LanguageSelect } from "@/components/deck/language-select";
import { useSession, type SessionCounts } from "@/components/deck/session-provider";
import { SessionSummary } from "@/components/deck/session-summary";
import type { SwipeDirection, SwipeCardHandle } from "@/components/deck/swipe-card";
import { Wordmark } from "@/components/wordmark";
import { COPY } from "@/lib/copy";
import { useSettings } from "@/lib/store";
import { showToast } from "@/lib/toast";
import { useResolvedTheme } from "@/lib/use-resolved-theme";

function ProgressSegments({ progress, total }: { progress: number; total: number }) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-label={COPY.deck.sesiProgress}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={progress}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1 flex-1 rounded-full ${
            index < progress ? "bg-primary" : "bg-base-300"
          }`}
        />
      ))}
    </div>
  );
}

export function ExploreView(): React.ReactElement {
  const router = useRouter();
  const session = useSession();
  const { haptics } = useSettings();
  const theme = useResolvedTheme();
  const cardRef = useRef<SwipeCardHandle | null>(null);

  const vibrate = useCallback(() => {
    if (!haptics) return;
    try {
      navigator.vibrate?.(10);
    } catch {
      // Unsupported browsers simply skip it.
    }
  }, [haptics]);

  const { status, current, save, skip, undo, hideCurrent: hideCardNow, total } = session;

  const commit = useCallback(
    (direction: SwipeDirection) => {
      vibrate();
      if (direction === "save") {
        save();
        showToast({
          message: COPY.deck.disimpan,
          undoLabel: COPY.umum.urungkan,
          onUndo: undo,
        });
      } else {
        skip();
        showToast({
          message: COPY.deck.dilewati,
          undoLabel: COPY.umum.urungkan,
          onUndo: undo,
        });
      }
    },
    [save, skip, undo, vibrate],
  );

  const requestAction = useCallback(
    (direction: SwipeDirection) => {
      if (status !== "ready" || !current) return;
      cardRef.current?.fling(direction);
    },
    [status, current],
  );

  const openReader = useCallback(() => {
    if (!current) return;
    vibrate();
    router.push(`/read/${current.lang}/${current.pageId}`);
  }, [router, current, vibrate]);

  const hideCurrent = useCallback(() => {
    if (!current) return;
    hideCardNow();
    showToast({ message: COPY.deck.sembunyikanBerhasil });
  }, [current, hideCardNow]);

  const counts: SessionCounts = session.counts;

  useEffect(() => {
    if (session.status !== "ready") return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [role="menu"], [role="dialog"], [contenteditable="true"]',
        )
      ) {
        return;
      }
      if (document.querySelector("dialog[open]")) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          requestAction("skip");
          break;
        case "ArrowRight":
          event.preventDefault();
          requestAction("save");
          break;
        case "ArrowUp":
          event.preventDefault();
          openReader();
          break;
        case "Enter": {
          const active = document.activeElement;
          const onCard =
            active === document.body || active?.getAttribute("role") === "group";
          if (onCard) {
            event.preventDefault();
            openReader();
          }
          break;
        }
        case "z":
        case "Z":
          event.preventDefault();
          session.undo();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [session, requestAction, openReader]);

  const showDeck = session.status === "ready" && session.current !== null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] w-full max-w-[480px] flex-col md:h-dvh">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-4">
        <Wordmark size="sm" asLink={false} />
        <LanguageSelect />
      </header>

      <div className="shrink-0 px-4 pb-3">
        <ProgressSegments
          progress={Math.min(session.acted + (showDeck ? 1 : 0), total)}
          total={total}
        />
      </div>

      <div className="relative min-h-0 flex-1 px-4 pb-2">
        <p className="sr-only" aria-live="polite">
          {session.current
            ? `${COPY.deck.kartuKe(session.acted + 1, total)}: ${session.current.title}`
            : COPY.umum.memuat}
        </p>

        {session.status === "loading" ? (
          <DeckSkeleton />
        ) : session.status === "error" ? (
          <DeckError
            title={COPY.error.judul}
            message={
              session.errorCode === "empty" ? COPY.deck.semuaTersembunyi : COPY.error.pesan
            }
            onRetry={session.retry}
          />
        ) : session.status === "done" ? (
          <SessionSummary counts={counts} onRestart={session.restart} />
        ) : showDeck ? (
          <CardStack
            cards={session.visibleCards}
            theme={theme}
            topRef={cardRef}
            onAction={commit}
            onOpen={openReader}
            onHide={hideCurrent}
          />
        ) : (
          <DeckSkeleton />
        )}
      </div>

      <DeckActions
        canUndo={session.canUndo}
        disabled={!showDeck}
        onSkip={() => requestAction("skip")}
        onSave={() => requestAction("save")}
        onRead={openReader}
        onUndo={session.undo}
      />

      <p className="sr-only" role="note">
        {COPY.deck.petunjukKeyboard}
      </p>
    </div>
  );
}
