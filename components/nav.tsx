"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Search, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { COPY } from "@/lib/copy";
import { Wordmark } from "@/components/wordmark";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra route prefixes that should light up this tab. */
  matches: string[];
};

const ITEMS: NavItem[] = [
  { href: "/", label: COPY.nav.jelajah, icon: Compass, matches: ["/", "/read"] },
  { href: "/collection", label: COPY.nav.koleksi, icon: Bookmark, matches: ["/collection"] },
  { href: "/search", label: COPY.nav.cari, icon: Search, matches: ["/search"] },
  {
    href: "/settings",
    label: COPY.nav.pengaturan,
    icon: SlidersHorizontal,
    matches: ["/settings"],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  return item.matches.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
  );
}

export function BottomTabs(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-base-100/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 pt-1 pb-1.5"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-5 top-0 h-[2px] rounded-full transition-colors ${
                    active ? "bg-primary" : "bg-transparent"
                  }`}
                />
                <Icon
                  aria-hidden="true"
                  size={22}
                  strokeWidth={active ? 1.9 : 1.5}
                  className={active ? "text-primary" : "text-muted"}
                />
                <span
                  className={`tab-label text-[0.625rem] ${
                    active
                      ? "font-semibold text-base-content"
                      : "font-medium text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideRail(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama (layar lebar)"
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-hairline bg-base-200/60 md:flex md:w-[4.5rem] lg:w-[14.5rem]"
    >
      <div className="flex h-16 items-center px-4 lg:px-6">
        <span className="hidden lg:block">
          <Wordmark size="sm" />
        </span>
        <span className="mx-auto lg:hidden">
          <span className="font-display text-[1.25rem] italic" aria-hidden="true">
            W
          </span>
          <span className="sr-only">{COPY.wordmark}</span>
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-2 py-3 lg:px-3">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-12 items-center gap-3 rounded-[var(--radius-field)] px-3 py-2.5 transition-colors ${
                  active
                    ? "bg-base-100 text-base-content shadow-[inset_0_0_0_1px_var(--color-hairline)]"
                    : "text-muted hover:bg-base-300/50 hover:text-base-content"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full ${
                    active ? "bg-primary" : "bg-transparent"
                  }`}
                />
                <Icon
                  aria-hidden="true"
                  size={20}
                  strokeWidth={active ? 1.9 : 1.5}
                  className={active ? "text-primary" : undefined}
                />
                <span
                  className={`hidden text-[0.875rem] lg:inline ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
                <span className="sr-only lg:hidden">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="hidden px-6 pb-6 lg:block">
        <span className="label-caps block text-[0.5625rem] leading-relaxed text-muted">
          {COPY.pengaturan.tentangIsi.split(".")[0]}.
        </span>
      </p>
    </nav>
  );
}
