import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";

type Item = {
  href: string;
  label: string;
  /** Decorative: the label always shows, so the icon is hidden from readers. */
  icon: ReactNode;
};

type Props = {
  items: Item[];
  /** The href of the active item. An href that matches no item marks none. */
  current: string;
  /**
   * The element to render each entry as. Apps pass their router's link —
   * `as={NextLink}` — which keeps `next` out of the design system.
   */
  as?: ElementType;
  /** The nav's accessible name, in the visitor's language. */
  label: string;
  className?: string;
};

/**
 * The tab bar of a phone-first screen, fixed to the bottom of the viewport.
 * Pure and server-safe: the caller says which item is
 * active, so the only client code an app needs is the wrapper that reads the
 * pathname.
 *
 * The active item is marked three ways — colour, weight and the bar above it —
 * so the mark does not rest on colour alone. Each entry is at least 64 px tall
 * and a third of the width, above the 48 px touch target. The bar pads for the
 * phone's home indicator; the page under it pads for the bar.
 */
export const BottomNav = ({
  items,
  current,
  as: Tag = "a",
  label,
  className,
}: Props) => (
  <nav
    aria-label={label}
    className={cn(
      "bg-background fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]",
      className,
    )}
  >
    <ul className="mx-auto flex max-w-xl">
      {items.map((item) => {
        const active = item.href === current;

        return (
          <li key={item.href} className="flex-1">
            <Tag
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring ease-standard relative flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-sm outline-none transition-colors duration-[--duration-fast] focus-visible:ring-[3px] focus-visible:ring-inset [&_svg]:size-6",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground font-medium",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-6 top-0 h-1 rounded-b-full",
                  active ? "bg-primary" : "bg-transparent",
                )}
              />
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Tag>
          </li>
        );
      })}
    </ul>
  </nav>
);
