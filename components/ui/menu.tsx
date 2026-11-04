"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

export type MenuItem = {
  label: string;
  icon: LucideIcon;
  onSelect?: () => void;
  href?: string;
  tone?: "default" | "danger";
};

type MenuProps = {
  label: string;
  items: MenuItem[];
  trigger?: "icon" | "text";
  triggerLabel?: string;
};

type Position = { top: number; left: number };

const MENU_WIDTH = 232;
const MENU_GAP = 6;

/**
 * Overflow menu rendered in a portal so transformed ancestors (the dragging
 * deck card) and `overflow: hidden` containers can never clip it.
 */
export function Menu({ label, items, trigger = "icon", triggerLabel }: MenuProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    );
    const estimated = Math.min(items.length * 48 + 8, 320);
    const below = rect.bottom + MENU_GAP;
    const top =
      below + estimated > window.innerHeight - 8
        ? Math.max(8, rect.top - estimated - MENU_GAP)
        : below;
    setPosition({ top, left });
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    place();
    const menu = menuRef.current;
    const first = menu?.querySelector<HTMLElement>("[data-menu-item]");
    first?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        setOpen(false);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const nodes = Array.from(
        menu?.querySelectorAll<HTMLElement>("[data-menu-item]") ?? [],
      );
      if (nodes.length === 0) return;
      event.preventDefault();
      const index = nodes.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? (index + 1) % nodes.length
          : (index - 1 + nodes.length) % nodes.length;
      nodes[next].focus();
    };

    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onReposition = (): void => setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, place]);

  // The menu only opens from a click, so a portal is never needed while rendering
  // on the server.
  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="fixed z-[60] overflow-hidden rounded-[var(--radius-field)] bg-base-200 py-1 shadow-float"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const className = `flex w-full items-center gap-3 px-4 py-3 text-left t-14 hover:bg-base-300 ${
              item.tone === "danger" ? "text-error" : "text-base-content"
            }`;

            if (item.href) {
              return (
                <a
                  key={item.label}
                  role="menuitem"
                  data-menu-item
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                data-menu-item
                className={className}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        data-no-drag
        onClick={() => setOpen((value) => !value)}
        className={
          trigger === "icon"
            ? "inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-selector)] border border-hairline bg-base-200/90 text-base-content hover:bg-base-300"
            : "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-field)] px-3 t-14 font-medium text-base-content hover:bg-base-200"
        }
      >
        {trigger === "icon" ? (
          <MoreHorizontal aria-hidden="true" size={20} strokeWidth={1.5} />
        ) : null}
        {trigger === "text" ? triggerLabel ?? label : null}
      </button>
      {menu}
    </>
  );
}
