import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Container } from "../container";
import { Section } from "../section";
import { Typography } from "../typography";

type Props = {
  /** A short qualifier above the headline — a category, a stage, a claim. */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * The calls to action, rendered by the caller.
   *
   * A ReactNode rather than a data array because `Button` is a client component
   * and this one is not — a server page renders the buttons and passes them down,
   * which costs nothing and keeps the boundary where it belongs. See
   * packages/ui/AGENTS.md.
   */
  actions?: ReactNode;
  /** A screenshot, illustration or video. Sits beside the copy at `align="left"`. */
  media?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export const Hero = ({
  eyebrow,
  title,
  subtitle,
  actions,
  media,
  align = "center",
  className,
}: Props) => {
  const centred = align === "center";

  return (
    <Section spacing="lg" className={cn("overflow-hidden", className)}>
      <Container
        className={cn(
          "grid items-center gap-12",
          centred ? "max-w-3xl text-center" : "lg:grid-cols-2 lg:gap-16",
        )}
      >
        <div className={cn("flex flex-col gap-6", centred && "items-center")}>
          {eyebrow ? <div>{eyebrow}</div> : null}

          <Typography
            as="h1"
            variant="display"
            size="5xl"
            balance
            className="md:text-6xl"
          >
            {title}
          </Typography>

          {subtitle ? (
            <Typography
              variant="lead"
              size="lg"
              balance
              className={cn("max-w-xl", centred && "mx-auto")}
            >
              {subtitle}
            </Typography>
          ) : null}

          {actions ? (
            <div
              className={cn(
                "flex flex-col gap-3 sm:flex-row",
                centred ? "justify-center" : "",
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>

        {media ? (
          <div className={cn(centred && "mt-4 w-full")}>{media}</div>
        ) : null}
      </Container>
    </Section>
  );
};
