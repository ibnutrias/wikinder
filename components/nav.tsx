"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Search, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { COPY } from "@/lib/copy";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
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

export function BottomTabs(): React.ReactElement | null {
  const pathname = usePathname();
  // The reader owns the bottom of the screen with its own action bar.
  if (pathname.startsWith("/read/")) return null;

  return (
    <nav
      aria-label={COPY.nav.utama}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-base-100 md:hidden"
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
                className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1 py-1.5"
              >
                <Icon
                  aria-hidden="true"
                  size={24}
                  strokeWidth={1.5}
                  className={active ? "text-primary" : "text-muted"}
                />
                <span
                  className={`t-12 ${active ? "font-semibold text-primary" : "font-medium text-muted"}`}
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

export function SideRail(): React.ReactElement | null {
  const pathname = usePathname();
  if (pathname.startsWith("/read/")) return null;

  return (
    <nav
      aria-label={COPY.nav.utamaLebar}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-hairline bg-base-100 md:flex md:w-[4.5rem] lg:w-[15rem]"
    >
      <div className="flex h-16 items-center px-4 lg:px-5">
        <span className="hidden lg:block">
          <Wordmark size="sm" />
        </span>
        <span className="mx-auto lg:hidden">
          <span className="t-18 font-semibold" aria-hidden="true">
            W<span className="text-primary">.</span>
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
                className={`flex min-h-12 items-center gap-3 rounded-[var(--radius-field)] px-3 py-2.5 transition-colors duration-[var(--duration-fast)] lg:border ${
                  active
                    ? "bg-base-200 text-base-content lg:border-hairline"
                    : "text-muted hover:bg-base-200 hover:text-base-content lg:border-transparent"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  size={20}
                  strokeWidth={1.5}
                  className={active ? "text-primary" : undefined}
                />
                <span
                  className={`hidden t-14 lg:inline ${active ? "font-semibold" : "font-medium"}`}
                >
                  {item.label}
                </span>
                <span className="sr-only lg:hidden">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="hidden px-5 pb-5 t-12 leading-relaxed text-muted lg:block">
        {COPY.pengaturan.tentangIsi}
      </p>
    </nav>
  );
}
