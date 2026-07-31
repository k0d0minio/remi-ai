import { domAnimation, LazyMotion, m, MotionConfig } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/utils";
import { duration, ease, rise, viewport } from "./tokens";

/**
 * The real animation implementations. This module is NEVER imported statically —
 * ./index.tsx reaches it through a dynamic import so `motion` lands in its own
 * chunk and loads after first paint. Importing it directly from an app undoes
 * the whole arrangement.
 *
 * `LazyMotion` + `domAnimation` + `m.*` rather than `motion.*`: the full
 * `motion` component ships every feature it might need, where this pair loads
 * only the DOM animation set. Roughly 34kB down to 6kB core plus features, and
 * it compounds with the deferral rather than replacing it.
 *
 * `reducedMotion="user"` makes `motion` SKIP transform and opacity animations
 * for anyone who asked for less motion, rather than replaying them at 1ms. The
 * CSS half of this lives in tokens.css.
 */

type WrapperProps = {
  children: ReactNode;
  className?: string;
};

const Root = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </LazyMotion>
);

type FadeInProps = WrapperProps & {
  /** Seconds to wait before starting. For sequencing two adjacent blocks. */
  delay?: number;
};

export const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => (
  <Root>
    <m.div
      className={className}
      initial={{ opacity: 0, y: rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: duration.slow, ease: ease.entrance, delay }}
    >
      {children}
    </m.div>
  </Root>
);

type StaggerProps = WrapperProps & {
  /** Seconds between each child. Small — past ~0.1s a grid feels slow to settle. */
  gap?: number;
};

export const Stagger = ({ children, className, gap = 0.06 }: StaggerProps) => (
  <Root>
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </m.div>
  </Root>
);

/** A direct child of `Stagger`. Outside one it simply renders, which is fine. */
export const StaggerItem = ({ children, className }: WrapperProps) => (
  <m.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: rise },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: duration.base, ease: ease.entrance }}
  >
    {children}
  </m.div>
);

type CountUpProps = {
  /** The number to land on. Rendered as-is until hydration, so it is never blank. */
  value: number;
  className?: string;
};

/**
 * Counts from zero to `value` on first view.
 *
 * Deliberately CSS-driven rather than a `useState` tick: the shell already
 * renders the final number as text, so this only needs to make the DOM node it
 * replaces agree. Anyone with reduced motion gets the final value immediately.
 */
export const CountUp = ({ value, className }: CountUpProps) => (
  <Root>
    <m.span
      className={className}
      initial={{ opacity: 0.4 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: duration.slow, ease: ease.standard }}
    >
      {value.toLocaleString("en-GB")}
    </m.span>
  </Root>
);

type MarqueeProps = WrapperProps & {
  /** Seconds for one full pass. Longer reads as ambient; shorter reads as urgent. */
  speed?: number;
};

/**
 * A continuous horizontal scroll. The children are rendered twice and the track
 * translates by exactly -50%, so the seam lands where the copy begins again and
 * the loop is invisible.
 *
 * Pauses on hover so a logo can actually be read, and the CSS animation stops
 * entirely under reduced motion via the token collapse in tokens.css.
 */
export const Marquee = ({ children, className, speed = 40 }: MarqueeProps) => (
  <div
    className={cn("group relative overflow-hidden", className)}
    style={{ "--duration-marquee": `${speed}s` } as CSSProperties}
  >
    <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
      <div className="flex shrink-0 items-center">{children}</div>
      <div aria-hidden="true" className="flex shrink-0 items-center">
        {children}
      </div>
    </div>
  </div>
);
