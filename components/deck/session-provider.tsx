"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { requestCards } from "@/lib/client-api";
import { filterCards, mergeQueue, shouldPrefetch } from "@/lib/queue";
import {
  hideCard,
  markSeen,
  removeCard,
  saveCard,
  useHidden,
  useSeen,
  useSettings,
} from "@/lib/store";
import type { Card, ArticleLang } from "@/lib/types";

const MAX_UNDO = 10;
const MAX_FETCH_ATTEMPTS = 3;

export type DeckAction = { type: "save" | "skip"; card: Card };

export type SessionStatus = "loading" | "ready" | "error" | "done";

export type SessionCounts = {
  seen: number;
  saved: number;
  skipped: number;
};

type SessionApi = {
  status: SessionStatus;
  lang: ArticleLang;
  total: number;
  visibleCards: Card[];
  current: Card | null;
  acted: number;
  canUndo: boolean;
  counts: SessionCounts;
  errorCode: string | null;
  save: () => void;
  skip: () => void;
  undo: () => void;
  hideCurrent: () => void;
  restart: () => void;
  retry: () => void;
};

const SessionContext = createContext<SessionApi | null>(null);

type State = {
  /** The request this data belongs to; stale data is never rendered. */
  key: string;
  cards: Card[];
  cursor: number;
  actions: DeckAction[];
  status: "loading" | "ready" | "error";
  errorCode: string | null;
};

const INITIAL: State = {
  key: "",
  cards: [],
  cursor: 0,
  actions: [],
  status: "loading",
  errorCode: null,
};

export function SessionProvider({ children }: { children: ReactNode }): React.ReactElement {
  const { lang, imageOnly, sessionLength } = useSettings();
  const seen = useSeen();
  const hidden = useHidden();

  const seenRef = useRef(seen);
  const hiddenRef = useRef(hidden);
  useEffect(() => {
    seenRef.current = seen;
  }, [seen]);
  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  const [state, setState] = useState<State>(INITIAL);
  const [generation, setGeneration] = useState(0);
  const loadingRef = useRef(false);

  const requestKey = `${lang}|${imageOnly ? "images" : "all"}|${generation}`;
  const fresh = state.key === requestKey;

  const loadBatch = useCallback(
    async (signal: AbortSignal): Promise<Card[]> => {
      const collected: Card[] = [];
      for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
        if (signal.aborted) return [];
        const batch = await requestCards(lang, signal);
        const fresh = filterCards(batch, {
          seen: [...seenRef.current, ...collected.map((card) => card.pageId)],
          hidden: hiddenRef.current,
          imageOnly,
        });
        collected.push(...fresh);
        if (collected.length > 0) break;
      }
      return collected;
    },
    [lang, imageOnly],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadingRef.current = true;

    loadBatch(controller.signal)
      .then((cards) => {
        if (controller.signal.aborted) return;
        setState({
          key: requestKey,
          cards,
          cursor: 0,
          actions: [],
          status: cards.length > 0 ? "ready" : "error",
          errorCode: cards.length > 0 ? null : "empty",
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const code =
          error instanceof Error && "code" in error
            ? String((error as { code: unknown }).code)
            : "network";
        setState({ ...INITIAL, key: requestKey, status: "error", errorCode: code });
      })
      .finally(() => {
        loadingRef.current = false;
      });

    return () => {
      controller.abort();
    };
  }, [loadBatch, requestKey]);

  // Prefetch the next small batch when the unread tail gets short.
  useEffect(() => {
    if (!fresh || state.status !== "ready") return;
    const remaining = state.cards.length - state.cursor;
    if (!shouldPrefetch(remaining) || loadingRef.current) return;

    const controller = new AbortController();
    loadingRef.current = true;

    loadBatch(controller.signal)
      .then((cards) => {
        if (controller.signal.aborted || cards.length === 0) return;
        setState((prev) =>
          prev.key === requestKey
            ? { ...prev, cards: mergeQueue(prev.cards, cards) }
            : prev,
        );
      })
      .catch(() => {
        // Prefetch failures stay silent; the visible stack keeps working.
      })
      .finally(() => {
        loadingRef.current = false;
      });

    return () => {
      controller.abort();
    };
  }, [fresh, state.cards.length, state.cursor, state.status, loadBatch, requestKey]);

  const cards = fresh ? state.cards : [];
  const cursor = fresh ? state.cursor : 0;
  const actions = useMemo(() => (fresh ? state.actions : []), [fresh, state.actions]);
  const current = cards[cursor] ?? null;

  const advance = useCallback(
    (action: DeckAction) => {
      setState((prev) =>
        prev.key !== requestKey
          ? prev
          : {
              ...prev,
              cursor: prev.cursor + 1,
              actions: [...prev.actions, action].slice(-MAX_UNDO),
            },
      );
    },
    [requestKey],
  );

  const save = useCallback(() => {
    if (!current) return;
    saveCard(current);
    markSeen(current.pageId);
    advance({ type: "save", card: current });
  }, [advance, current]);

  const skip = useCallback(() => {
    if (!current) return;
    markSeen(current.pageId);
    advance({ type: "skip", card: current });
  }, [advance, current]);

  const undo = useCallback(() => {
    const last = actions[actions.length - 1];
    if (!last) return;
    if (last.type === "save") removeCard(last.card.pageId);
    setState((prev) =>
      prev.key !== requestKey
        ? prev
        : {
            ...prev,
            cursor: Math.max(0, prev.cursor - 1),
            actions: prev.actions.slice(0, -1),
          },
    );
  }, [actions, requestKey]);

  const hideCurrent = useCallback(() => {
    if (!current) return;
    hideCard(current.pageId);
    markSeen(current.pageId);
    advance({ type: "skip", card: current });
  }, [advance, current]);

  const restart = useCallback(() => setGeneration((value) => value + 1), []);
  const retry = useCallback(() => setGeneration((value) => value + 1), []);

  const acted = actions.length;
  const status: SessionStatus = !fresh
    ? "loading"
    : acted >= sessionLength
      ? "done"
      : state.status;

  const counts: SessionCounts = {
    seen: acted,
    saved: actions.filter((action) => action.type === "save").length,
    skipped: actions.filter((action) => action.type === "skip").length,
  };

  const value: SessionApi = {
    status,
    lang,
    total: sessionLength,
    visibleCards: cards.slice(cursor, cursor + 3),
    current,
    acted,
    canUndo: actions.length > 0,
    counts,
    errorCode: fresh ? state.errorCode : null,
    save,
    skip,
    undo,
    hideCurrent,
    restart,
    retry,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
