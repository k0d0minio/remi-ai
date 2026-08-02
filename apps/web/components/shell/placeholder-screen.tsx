import { Compass } from "lucide-react";
import { EmptyState, Typography } from "@remi/ui/server";
import type { Content, PlaceholderContent } from "@/lib/content/types";

type Props = {
  screen: PlaceholderContent;
  content: Content;
};

/**
 * A route that exists so the shell's navigation is honest, before the screen
 * behind it does. It says what will live here rather than rendering an empty
 * panel, and names where the design for it is being worked out.
 */
export const PlaceholderScreen = ({ screen, content }: Props) => (
  <div className="mx-auto flex max-w-3xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        {screen.title}
      </Typography>
      <Typography tone="muted">{screen.body}</Typography>
    </div>

    <EmptyState
      icon={Compass}
      intent="info"
      title={content.prototypeNote.title}
      body={content.prototypeNote.body}
    />
  </div>
);
