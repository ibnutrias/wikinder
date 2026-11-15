"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, EyeOff, Link2, List, Quote, Share2 } from "lucide-react";
import { ReaderActions } from "@/components/reader/reader-actions";
import { ReaderBody } from "@/components/reader/reader-body";
import { ReaderHeader } from "@/components/reader/reader-header";
import { TocRail, TocSheet } from "@/components/reader/reader-toc";
import {
  CiteSheet,
  DisplaySheet,
  HighlightsSheet,
  ImageDialog,
  ShortcutsSheet,
} from "@/components/reader/reader-sheets";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/components/ui/menu";
import { requestCards } from "@/lib/client-api";
import { copyText } from "@/lib/clipboard";
import { COPY } from "@/lib/copy";
import { textHash } from "@/lib/hash";
import type { ArticleSection, ParsedArticle } from "@/lib/article";
import { readerStyle } from "@/lib/reader-style";
import {
  addHighlight,
  clearResume,
  hideCard,
  readStore,
  removeHighlight,
  saveCard,
  saveResumeQuiet,
  setCardStatus,
  updateSettings,
  useCollection,
  useHighlights,
  useHydrated,
  useSettings,
} from "@/lib/store";
import { showToast } from "@/lib/toast";
import { useReaderChrome } from "@/lib/use-reader-chrome";
import { useScrollSpy } from "@/lib/use-scroll-spy";
import { useSpeech } from "@/lib/use-speech";
import { useResolvedTheme } from "@/lib/use-resolved-theme";
import { LANG_LABEL, type FullArticle } from "@/lib/wikipedia";
import type { ArticleLang } from "@/lib/types";

const INTRO_ID = "ringkasan";

type SheetName = "toc" | "display" | "cite" | "highlights" | "shortcuts" | null;

export function ReaderView({
  article,
  parsed,
}: {
  article: FullArticle;
  parsed: ParsedArticle;
}): React.ReactElement {
  const router = useRouter();
  const settings = useSettings();
  const theme = useResolvedTheme();
  const collection = useCollection();
  const highlights = useHighlights();
  const hydrated = useHydrated();

  const [manualOpen, setManualOpen] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [sheet, setSheet] = useState<SheetName>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [dismissedResume, setDismissedResume] = useState(false);
  const [nextCard, setNextCard] = useState<{ lang: ArticleLang; pageId: number } | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  const [titleVisible, setTitleVisible] = useState(false);
  const savedStatus = collection.find((item) => item.card.pageId === article.pageId)?.status ?? null;

  /* ---------------------------------------------------------------- state */

  const openSections = useMemo(() => {
    const set = new Set<string>();
    for (const section of parsed.sections) {
      const manual = manualOpen.get(section.id);
      if (manual !== undefined) {
        if (manual) set.add(section.id);
      } else if (settings.openAllSections || section === parsed.sections[0]) {
        set.add(section.id);
      }
    }
    return set;
  }, [manualOpen, parsed.sections, settings.openAllSections]);

  const paragraphMap = useMemo(() => {
    const map = new Map<string, string>();
    parsed.intro
      .split("\n\n")
      .filter(Boolean)
      .forEach((text, index) => map.set(`${INTRO_ID}:${index}`, text));
    for (const section of parsed.sections) {
      section.paragraphs.forEach((text, index) => map.set(`${section.id}:${index}`, text));
    }
    return map;
  }, [parsed]);

  const validHighlights = useMemo(
    () =>
      highlights.filter((entry) => {
        if (entry.pageId !== article.pageId || entry.lang !== article.lang) return false;
        const text = paragraphMap.get(`${entry.sectionId}:${entry.paragraphIndex}`);
        return text !== undefined && textHash(text) === entry.textHash;
      }),
    [highlights, article.pageId, article.lang, paragraphMap],
  );

  const highlightKeys = useMemo(
    () => new Set(validHighlights.map((entry) => `${entry.sectionId}:${entry.paragraphIndex}`)),
    [validHighlights],
  );

  const activeId = useScrollSpy(parsed.sections.map((section) => section.id));

  const resumeEntry = useMemo(() => {
    if (!hydrated || dismissedResume || !settings.resumePrompt) return null;
    const entry = readStore().resume.find((item) => item.pageId === article.pageId);
    if (!entry) return null;
    return parsed.sections.some((section) => section.id === entry.sectionId) ? entry : null;
  }, [hydrated, dismissedResume, settings.resumePrompt, article.pageId, parsed.sections]);

  /* --------------------------------------------------------------- scroll */

  const { headerHidden } = useReaderChrome(progressRef, {
    onNearEnd: () => {
      if (savedStatus === "want") {
        showToast({
          message: COPY.reader.tandaiPrompt,
          undoLabel: COPY.reader.tandaiYa,
          onUndo: () => {
            setCardStatus(article.pageId, "read");
            showToast({ message: COPY.reader.ditandaiSelesai });
          },
        });
      }
    },
  });

  const activeIdRef = useRef<string | null>(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    let frame = 0;
    let lastWrite = 0;
    const onScroll = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const now = Date.now();
        if (now - lastWrite < 1200) return;
        lastWrite = now;
        const sectionId = activeIdRef.current;
        if (!sectionId) return;
        const element = document.getElementById(sectionId);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const offset = Math.min(1, Math.max(0, (96 - rect.top) / Math.max(1, rect.height)));
        const section = parsed.sections.find((item) => item.id === sectionId);
        if (!section) return;
        saveResumeQuiet({
          pageId: article.pageId,
          lang: article.lang,
          sectionId,
          sectionTitle: section.title,
          offset,
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [activeId, article.pageId, article.lang, parsed.sections]);

  /* ------------------------------------------------------------ behaviours */

  useEffect(() => {
    document.documentElement.lang = article.lang;
    return () => {
      document.documentElement.lang = "id";
    };
  }, [article.lang]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const reveal = useCallback((id: string, behavior: ScrollBehavior = "smooth") => {
    setManualOpen((previous) => new Map(previous).set(id, true));
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
    });
  }, []);

  useEffect(() => {
    const fromHash = (): void => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;
      window.requestAnimationFrame(() => {
        if (!document.getElementById(id)) return;
        setManualOpen((previous) => new Map(previous).set(id, true));
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const nextRandom = useCallback(() => {
    if (!nextCard) return;
    router.push(`/read/${nextCard.lang}/${nextCard.pageId}`);
  }, [nextCard, router]);

  useEffect(() => {
    const controller = new AbortController();
    requestCards(article.lang, controller.signal)
      .then((cards) => {
        const first = cards[0];
        if (first) setNextCard({ lang: first.lang, pageId: first.pageId });
      })
      .catch(() => {
        // Prefetch is optional; the button stays disabled.
      });
    return () => controller.abort();
  }, [article.lang]);

  const toggleHighlight = useCallback(
    (sectionId: string, index: number, text: string) => {
      const existing = validHighlights.find(
        (entry) => entry.sectionId === sectionId && entry.paragraphIndex === index,
      );
      if (existing) {
        removeHighlight(article.pageId, sectionId, index);
        showToast({ message: COPY.reader.sorotanDihapus });
        return;
      }
      addHighlight({
        pageId: article.pageId,
        lang: article.lang,
        sectionId,
        paragraphIndex: index,
        textHash: textHash(text),
      });
    },
    [validHighlights, article.pageId, article.lang],
  );

  const speech = useSpeech(article.lang, settings.speechRate);
  const speechParagraphs = useMemo(
    () => Array.from(paragraphMap.entries()).map(([id, text]) => ({ id, text })),
    [paragraphMap],
  );

  useEffect(() => {
    if (!speech.activeId) return;
    const element = document.getElementById(speech.activeId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [speech.activeId]);

  const startSpeech = useCallback(() => {
    if (speech.error === "no_voice") {
      showToast({ message: COPY.reader.suaraTiada });
      return;
    }
    speech.start(speechParagraphs);
  }, [speech, speechParagraphs]);

  const primaryAction = useCallback(() => {
    if (savedStatus === null) {
      saveCard({
        pageId: article.pageId,
        lang: article.lang,
        title: article.title,
        extract: article.extract,
        ...(article.thumbnail ? { thumbnail: article.thumbnail } : {}),
        url: article.url,
      });
      showToast({ message: COPY.reader.disimpan });
      return;
    }
    if (savedStatus === "want") {
      setCardStatus(article.pageId, "read");
      showToast({ message: COPY.reader.ditandaiSelesai });
    }
  }, [savedStatus, article]);

  const share = useCallback(async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: article.title, url: article.url });
        return;
      }
      if (await copyText(article.url)) showToast({ message: COPY.reader.tautanTersalin });
    } catch {
      // Share sheet dismissed.
    }
  }, [article]);

  const hide = useCallback(() => {
    hideCard(article.pageId);
    showToast({ message: COPY.deck.sembunyikanBerhasil });
    router.push("/");
  }, [article.pageId, router]);

  const menuItems: MenuItem[] = [
    { label: COPY.reader.sitasi, icon: Quote, onSelect: () => setSheet("cite") },
    { label: COPY.reader.sorotan, icon: Bookmark, onSelect: () => setSheet("highlights") },
    { label: COPY.reader.pintasan, icon: List, onSelect: () => setSheet("shortcuts") },
    { label: COPY.reader.bukaWikipedia, icon: Link2, href: article.url },
  ];

  const bottomMenu: MenuItem[] = [
    { label: COPY.reader.sitasi, icon: Quote, onSelect: () => setSheet("cite") },
    { label: COPY.reader.bagikan, icon: Share2, onSelect: () => void share() },
    { label: COPY.reader.bukaWikipedia, icon: Link2, href: article.url },
    { label: COPY.deck.sembunyikan, icon: EyeOff, onSelect: hide, tone: "danger" },
  ];

  /* ------------------------------------------------------------- shortcuts */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const currentIndex = parsed.sections.findIndex((section) => section.id === activeId);
      const move = (delta: number): void => {
        const next =
          currentIndex === -1
            ? parsed.sections[0]
            : parsed.sections[Math.min(parsed.sections.length - 1, Math.max(0, currentIndex + delta))];
        if (next) reveal(next.id);
      };

      switch (event.key) {
        case "j":
          event.preventDefault();
          move(1);
          break;
        case "k":
          event.preventDefault();
          move(-1);
          break;
        case "t":
          event.preventDefault();
          setSheet((value) => (value === "toc" ? null : "toc"));
          break;
        case "a":
          event.preventDefault();
          setSheet((value) => (value === "display" ? null : "display"));
          break;
        case "s":
          event.preventDefault();
          primaryAction();
          break;
        case "?":
          event.preventDefault();
          setSheet("shortcuts");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [parsed.sections, activeId, reveal, primaryAction]);

  const selectSection = (section: ArticleSection): void => {
    setSheet(null);
    reveal(section.id);
  };

  const openAll = (): void => {
    setManualOpen(new Map(parsed.sections.map((section) => [section.id, true])));
  };
  const closeAll = (): void => {
    setManualOpen(new Map(parsed.sections.map((section) => [section.id, false])));
  };

  return (
    <div style={readerStyle(settings)} className="min-h-dvh bg-base-100">
      <div className="no-print pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-base-300" aria-hidden="true">
        <div
          ref={progressRef}
          className="h-full origin-left scale-x-0 bg-primary"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <ReaderHeader
        title={article.title}
        titleVisible={titleVisible}
        hidden={headerHidden && !chromeHidden}
        onBack={() => {
          if (window.history.length > 1) router.back();
          else router.push("/");
        }}
        onOpenToc={() => setSheet("toc")}
        onOpenDisplay={() => setSheet("display")}
        menuItems={menuItems}
      />

      <div className="pt-14" style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}>
        <div
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest("a, button, summary, details, input, select, textarea")) return;
            setChromeHidden((value) => !value);
          }}
        >
          {resumeEntry ? (
            <div className="mx-auto max-w-[72ch] px-4 sm:px-6">
              <div className="mt-4 rounded-[var(--radius-box)] border border-hairline bg-base-200 p-4">
                <p className="t-14 font-semibold">{COPY.reader.lanjutBaca(resumeEntry.sectionTitle)}</p>
                <p className="mt-1 t-14 text-muted">{COPY.reader.lanjutBacaPesan}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="primary" size="md" onClick={() => reveal(resumeEntry.sectionId)}>
                    {COPY.reader.lanjutkan}
                  </Button>
                  <Button
                    size="md"
                    onClick={() => {
                      clearResume(article.pageId);
                      setDismissedResume(true);
                    }}
                  >
                    {COPY.reader.mulaiAwal}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mx-auto flex max-w-6xl gap-8 px-0 pb-28">
            <div className="min-w-0 flex-1">
            <ReaderBody
              article={article}
              parsed={parsed}
              theme={theme}
              openSections={openSections}
              onToggleSection={(id, open) => {
                if (open === openSections.has(id)) return;
                setManualOpen((previous) => new Map(previous).set(id, open));
              }}
              onOpenAll={openAll}
              onCloseAll={closeAll}
              highlightKeys={highlightKeys}
              onToggleHighlight={toggleHighlight}
              speechKey={speech.activeId}
              onOpenImage={() => setLightbox(true)}
              onNextRandom={nextRandom}
              nextReady={Boolean(nextCard)}
              articleRef={articleRef}
              titleRef={titleRef}
              headingSentinelRef={sentinelRef}
              introId={INTRO_ID}
            />
            </div>

            {parsed.sections.length > 0 && settings.showTocDesktop ? (
              <aside className="hidden w-56 shrink-0 py-8 lg:block">
                <TocRail
                  sections={parsed.sections}
                  activeId={activeId}
                  onSelect={selectSection}
                />
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <ReaderActions
        status={savedStatus}
        onPrimary={primaryAction}
        menuItems={bottomMenu}
        hidden={chromeHidden}
        speech={
          speech.supported
            ? {
                status: speech.status,
                rate: speech.rate,
                onStart: startSpeech,
                onPause: speech.pause,
                onResume: speech.resume,
                onStop: speech.stop,
                onRate: (rate) => {
                  speech.setRate(rate);
                  updateSettings({ speechRate: rate });
                },
              }
            : null
        }
      />

      <TocSheet
        open={sheet === "toc"}
        onClose={() => setSheet(null)}
        sections={parsed.sections}
        activeId={activeId}
        onSelect={selectSection}
      />
      <DisplaySheet open={sheet === "display"} onClose={() => setSheet(null)} />
      <CiteSheet
        open={sheet === "cite"}
        onClose={() => setSheet(null)}
        article={article}
        langLabel={LANG_LABEL[article.lang] ?? article.lang}
      />
      <HighlightsSheet
        open={sheet === "highlights"}
        onClose={() => setSheet(null)}
        entries={validHighlights.map((entry) => ({
          key: `${entry.sectionId}:${entry.paragraphIndex}`,
          sectionTitle:
            parsed.sections.find((section) => section.id === entry.sectionId)?.title ??
            COPY.reader.bagian,
          text: paragraphMap.get(`${entry.sectionId}:${entry.paragraphIndex}`) ?? "",
        }))}
        onRemove={(key) => {
          const [sectionId, index] = key.split(":");
          removeHighlight(article.pageId, sectionId, Number(index));
          showToast({ message: COPY.reader.sorotanDihapus });
        }}
      />
      <ShortcutsSheet open={sheet === "shortcuts"} onClose={() => setSheet(null)} />
      <ImageDialog open={lightbox} onClose={() => setLightbox(false)} article={article} />

      <span className="sr-only" aria-live="polite">
        {COPY.reader.progresBaca}
      </span>
    </div>
  );
}
