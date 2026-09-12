"use client";

import {
  Children,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type StatsCarouselProps = {
  children: ReactNode;
  /** Desktop/tablet grid columns, e.g. `sm:grid-cols-2 xl:grid-cols-4` */
  gridClassName?: string;
  className?: string;
  label?: string;
};

/**
 * Mobile: taller snap carousel with dot indicators.
 * sm+: normal responsive grid.
 */
export function StatsCarousel({
  children,
  gridClassName = "sm:grid-cols-2 xl:grid-cols-4",
  className,
  label = "Cartes stats",
}: StatsCarouselProps) {
  const items = Children.toArray(children).filter(Boolean);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth <= 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(Math.max(index, 0), items.length - 1));
  };

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="sm:hidden">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
        >
          {items.map((child, index) => (
            <div
              key={index}
              className="w-full shrink-0 snap-center px-0.5 [&_>_*]:min-h-[11.5rem]"
            >
              {child}
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <div
            className="mt-3 flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label={label}
          >
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Afficher carte ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  active === index
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className={cn("hidden gap-2.5 sm:grid", gridClassName)}>
        {items}
      </div>
    </div>
  );
}
