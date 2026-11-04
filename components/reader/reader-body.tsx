"use client";

import { memo, useRef, type RefObject } from "react";
import Image from "next/image";
import { ChevronDown, Highlighter } from "lucide-react";
import { TypographicCover } from "@/components/card/typographic-cover";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import { LANG_LABEL, type FullArticle } from "@/lib/wikipedia";
import type { ArticleSection, ParsedArticle } from "@/lib/article";
import type { Theme } from "@/lib/types";

const UPDATED = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

type ReaderParagraphProps = {
  id: string;
  text: string;
  highlighted: boolean;
  speaking: boolean;
  onToggleHighlight: () => void;
};

function ReaderParagraph({
  id,
  text,
  highlighted,
  speaking,
  onToggleHighlight,
}: ReaderParagraphProps) {
  const timer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const clear = (): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const start = (event: React.PointerEvent): void => {
    origin.current = { x: event.clientX, y: event.clientY };
    clear();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      onToggleHighlight();
    }, 520);
  };

  const move = (event: React.PointerEvent): void => {
    if (!origin.current) return;
    const dx = Math.abs(event.clientX - origin.current.x);
    const dy = Math.abs(event.clientY - origin.current.y);
    if (dx > 10 || dy > 10) clear();
  };

  return (
    <div className="group relative">
      <p
        id={id}
        data-paragraph
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={clear}
        onPointerLeave={clear}
        onPointerCancel={clear}
        onContextMenu={(event) => {
          if (timer.current !== null) event.preventDefault();
        }}
        className={`scroll-mt-24 rounded-[var(--radius-selector)] transition-colors duration-[var(--duration-fast)] ${
          highlighted ? "bg-primary/10 pl-2 -ml-2" : ""
        } ${speaking ? "bg-primary/15 pl-2 -ml-2" : ""}`}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={onToggleHighlight}
        aria-label={COPY.reader.sorot}
        aria-pressed={highlighted}
        className="absolute -right-1 top-1 hidden size-8 items-center justify-center rounded-[var(--radius-selector)] text-muted hover:bg-base-200 hover:text-base-content focus-visible:flex group-hover:flex md:flex md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        <Highlighter aria-hidden="true" size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

type ReaderBodyProps = {
  article: FullArticle;
  parsed: ParsedArticle;
  theme: Theme;
  openSections: Set<string>;
  onToggleSection: (id: string, open: boolean) => void;
  onOpenAll: () => void;
  onCloseAll: () => void;
  highlightKeys: Set<string>;
  onToggleHighlight: (sectionId: string, index: number, text: string) => void;
  speechKey: string | null;
  onOpenImage: () => void;
  onNextRandom: () => void;
  nextReady: boolean;
  articleRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  headingSentinelRef: RefObject<HTMLDivElement | null>;
  introId: string;
};

function SectionHeading({ level, children }: { level: 2 | 3 | 4; children: React.ReactNode }) {
  if (level === 2) return <h2 className="t-22">{children}</h2>;
  if (level === 3) return <h3 className="t-18 font-semibold">{children}</h3>;
  return <h4 className="t-16 font-semibold">{children}</h4>;
}

function Section({
  section,
  open,
  onToggle,
  paragraphs,
}: {
  section: ArticleSection;
  open: boolean;
  onToggle: (open: boolean) => void;
  paragraphs: React.ReactNode;
}) {
  return (
    <details
      id={section.id}
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
      className="scroll-mt-20 border-b border-hairline"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading level={section.level}>{section.title}</SectionHeading>
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={1.5}
          className="shrink-0 text-muted transition-transform duration-[var(--duration-base)]"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </summary>
      <div className="reader-prose space-y-4 pb-5">{paragraphs}</div>
    </details>
  );
}

function ReaderBodyComponent({
  article,
  parsed,
  theme,
  openSections,
  onToggleSection,
  onOpenAll,
  onCloseAll,
  highlightKeys,
  onToggleHighlight,
  speechKey,
  onOpenImage,
  onNextRandom,
  nextReady,
  articleRef,
  titleRef,
  headingSentinelRef,
  introId,
}: ReaderBodyProps) {
  const updated = article.touched ? UPDATED.format(new Date(article.touched)) : null;
  const introParagraphs = parsed.intro.split("\n\n").filter(Boolean);
  const hasSections = parsed.sections.length > 0;

  return (
    <article ref={articleRef} className="pb-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-base-300 sm:aspect-[21/9]">
        {article.thumbnail ? (
          <button
            type="button"
            onClick={onOpenImage}
            aria-label={COPY.reader.perbesarGambar}
            className="block h-full w-full"
          >
            <Image
              src={article.thumbnail.src}
              alt={COPY.reader.gambarArtikel}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          </button>
        ) : (
          <TypographicCover title={article.title} theme={theme} />
        )}
      </div>

      <div className="mx-auto max-w-[72ch] px-4 pt-6 sm:px-6">
        <h1 id="judul" ref={titleRef} className="t-36" lang={article.lang}>
          {article.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 t-14 text-muted">
          <span>{COPY.reader.menitBaca(readingMinutesOf(parsed.wordCount))}</span>
          <span>{LANG_LABEL[article.lang]}</span>
          {updated ? <span>{COPY.reader.diubah(updated)}</span> : null}
        </div>

        <div ref={headingSentinelRef} aria-hidden="true" className="h-px w-full" />

        {introParagraphs.length > 0 ? (
          <div className="reader-prose mt-6">
            {introParagraphs.map((text, index) => (
              <ReaderParagraph
                key={`intro-${index}`}
                id={`${introId}-${index}`}
                text={text}
                highlighted={highlightKeys.has(`${introId}:${index}`)}
                speaking={speechKey === `${introId}:${index}`}
                onToggleHighlight={() => onToggleHighlight(introId, index, text)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-[72ch] px-4 sm:px-6">
        {hasSections ? (
          <div className="mt-8 flex items-center justify-between gap-3">
            <p className="t-12 font-semibold text-muted">
              {parsed.sections.length} {COPY.reader.bagian}
            </p>
            {parsed.sections.length > 1 ? (
              <button
                type="button"
                onClick={openSections.size > 0 ? onCloseAll : onOpenAll}
                className="min-h-11 rounded-[var(--radius-selector)] px-2 t-14 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                {openSections.size > 0 ? COPY.reader.tutupSemua : COPY.reader.bukaSemua}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 t-16 text-muted">{COPY.reader.tanpaSeksi}</p>
        )}

        <div className="mt-2">
          {parsed.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              open={openSections.has(section.id)}
              onToggle={(open) => onToggleSection(section.id, open)}
              paragraphs={section.paragraphs.map((text, index) => (
                <ReaderParagraph
                  key={`${section.id}-${index}`}
                  id={`${section.id}-p${index}`}
                  text={text}
                  highlighted={highlightKeys.has(`${section.id}:${index}`)}
                  speaking={speechKey === `${section.id}:${index}`}
                  onToggleHighlight={() => onToggleHighlight(section.id, index, text)}
                />
              ))}
            />
          ))}
        </div>

        <section className="mt-10 border-t border-hairline pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={onNextRandom} disabled={!nextReady}>
              {COPY.reader.berikutnya}
            </Button>
            <Button href="/collection">{COPY.reader.keKoleksi}</Button>
          </div>

          <p className="mt-4 hidden t-12 print:block">
            {article.title}. {article.url}. CC BY-SA 4.0.
          </p>

          <p className="mt-5 max-w-[60ch] t-14 leading-relaxed text-muted">
            {COPY.reader.atribusi}{" "}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              {COPY.reader.lihatSumber}
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}

function readingMinutesOf(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

export const ReaderBody = memo(ReaderBodyComponent);
