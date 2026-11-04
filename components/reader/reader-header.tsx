"use client";

import { ArrowLeft, List, Type } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { COPY } from "@/lib/copy";

type ReaderHeaderProps = {
  title: string;
  /** Compact title appears once the big heading leaves the viewport. */
  titleVisible: boolean;
  hidden: boolean;
  onBack: () => void;
  onOpenToc: () => void;
  onOpenDisplay: () => void;
  menuItems: MenuItem[];
};

export function ReaderHeader({
  title,
  titleVisible,
  hidden,
  onBack,
  onOpenToc,
  onOpenDisplay,
  menuItems,
}: ReaderHeaderProps): React.ReactElement {
  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-40 border-b border-hairline bg-base-100 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-strong)] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="md:pl-[4.5rem] lg:pl-[15rem]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-2 sm:px-4">
          <IconButton label={COPY.reader.kembali} tone="ghost" onClick={onBack}>
            <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.5} />
          </IconButton>

          <p
            aria-hidden="true"
            className={`min-w-0 flex-1 truncate px-1 t-14 font-medium transition-opacity duration-[var(--duration-base)] ${
              titleVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {title}
          </p>

          <IconButton label={COPY.reader.daftarIsi} tone="ghost" onClick={onOpenToc}>
            <List aria-hidden="true" size={24} strokeWidth={1.5} />
          </IconButton>
          <IconButton label={COPY.reader.tampilanPanel} tone="ghost" onClick={onOpenDisplay}>
            <Type aria-hidden="true" size={24} strokeWidth={1.5} />
          </IconButton>
          <Menu label={COPY.reader.aksiLain} items={menuItems} trigger="icon" />
        </div>
      </div>
    </header>
  );
}
