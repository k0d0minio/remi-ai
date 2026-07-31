import { useEffect, useState, type ComponentType, type ReactNode } from "react";

/**
 * @remi/ui/motion — the animation layer's public surface.
 *
 * Every export here is a SHELL. It renders its children immediately, statically,
 * fully opaque and at their final position; then, after mount, it pulls
 * ./primitives in over a dynamic import and hands the same children to the real
 * animated version.
 *
 * That ordering is the whole point, and getting it wrong is silent:
 *
 *   • The content is in the server HTML. A wrapper that renders nothing until
 *     its chunk arrives takes the hero headline out of the document — which
 *     looks perfect in dev and guts LCP and indexability in production, on the
 *     one app whose entire mandate is Core Web Vitals.
 *
 *   • `motion` is never on the first-paint path. It lives behind the import()
 *     below and nowhere else, which is why neither @remi/ui nor @remi/ui/server
 *     may reach this directory (there is an ESLint rule for it).
 *
 *   • With no JavaScript at all, the page is complete and readable. The
 *     animation is additive — progressive enhancement, not a curtain that has to
 *     be raised.
 *
 * `children` are passed straight through, so a server-rendered subtree inside a
 * shell stays server-rendered.
 *
 * This deliberately does not use `next/dynamic`: a plain import() does the same
 * code-splitting without making the design system depend on a framework, and
 * `next/dynamic` with `ssr: false` throws when called from a Server Component
 * anyway.
 */

type Primitives = typeof import("./primitives");

/**
 * Loads ./primitives once per shell instance and returns the requested export,
 * or null until it arrives. Null is the cue to render the static fallback.
 */
const useAnimated = <K extends keyof Primitives>(name: K) => {
  const [Component, setComponent] = useState<Primitives[K] | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const primitives = await import("./primitives");
      if (active) {
        // Wrapped in a thunk: a component IS a function, and a bare setState
        // would call it instead of storing it.
        setComponent(() => primitives[name]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [name]);

  return Component;
};

type ShellProps = {
  children: ReactNode;
  className?: string;
};

type FadeInProps = ShellProps & {
  /** Seconds to wait before starting. For sequencing two adjacent blocks. */
  delay?: number;
};

export const FadeIn = ({ children, className, delay }: FadeInProps) => {
  const Animated = useAnimated("FadeIn") as ComponentType<FadeInProps> | null;
  if (!Animated) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Animated className={className} delay={delay}>
      {children}
    </Animated>
  );
};

type StaggerProps = ShellProps & {
  /** Seconds between each child. */
  gap?: number;
};

export const Stagger = ({ children, className, gap }: StaggerProps) => {
  const Animated = useAnimated("Stagger") as ComponentType<StaggerProps> | null;
  if (!Animated) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Animated className={className} gap={gap}>
      {children}
    </Animated>
  );
};

export const StaggerItem = ({ children, className }: ShellProps) => {
  const Animated = useAnimated(
    "StaggerItem",
  ) as ComponentType<ShellProps> | null;
  if (!Animated) {
    return <div className={className}>{children}</div>;
  }
  return <Animated className={className}>{children}</Animated>;
};

type CountUpProps = {
  value: number;
  className?: string;
};

export const CountUp = ({ value, className }: CountUpProps) => {
  const Animated = useAnimated("CountUp") as ComponentType<CountUpProps> | null;
  if (!Animated) {
    return <span className={className}>{value.toLocaleString("en-GB")}</span>;
  }
  return <Animated value={value} className={className} />;
};

type MarqueeProps = ShellProps & {
  /** Seconds for one full pass. */
  speed?: number;
};

export const Marquee = ({ children, className, speed }: MarqueeProps) => {
  const Animated = useAnimated("Marquee") as ComponentType<MarqueeProps> | null;
  if (!Animated) {
    // Static fallback: the same row, not scrolling, clipped at the edge. Every
    // logo is still in the HTML.
    return (
      <div className={className}>
        <div className="flex items-center overflow-hidden">{children}</div>
      </div>
    );
  }
  return (
    <Animated className={className} speed={speed}>
      {children}
    </Animated>
  );
};
