import { Separator, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Message, MessageAuthor } from "@/lib/mock/types";

type Props = {
  messages: Message[];
  /** Which side of the exchange is reading — theirs sits right, the other left. */
  viewer: MessageAuthor;
  /** How the other side signs, e.g. "Camille" or "Dr Mouton". */
  counterpartLabel: string;
};

type DayGroup = {
  day: string;
  messages: Message[];
};

/**
 * Grouped on the way out rather than stored grouped: the fixtures stay a flat
 * chronological list, which is the shape a real thread arrives in.
 */
const groupByDay = (messages: Message[]) =>
  messages.reduce<DayGroup[]>((groups, message) => {
    const current = groups.at(-1);

    if (current && current.day === message.day) {
      return [
        ...groups.slice(0, -1),
        { day: current.day, messages: [...current.messages, message] },
      ];
    }

    return [...groups, { day: message.day, messages: [message] }];
  }, []);

/**
 * One thread, rendered the same way on both sides of the loop — only `viewer`
 * changes. Deliberately server-safe: it holds no state, so whichever island
 * needs it can drop it in without dragging a boundary along.
 */
export const MessageThread = ({
  messages,
  viewer,
  counterpartLabel,
}: Props) => (
  <div className="flex flex-col gap-6">
    {groupByDay(messages).map((group) => (
      <div key={group.day} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Separator tone="subtle" className="flex-1" />
          <Typography as="span" size="xs" tone="muted">
            {group.day}
          </Typography>
          <Separator tone="subtle" className="flex-1" />
        </div>

        {group.messages.map((message) => {
          const mine = message.author === viewer;

          return (
            <div
              key={message.id}
              className={cn(
                "flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]",
                mine && "items-end self-end",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-3",
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                <Typography size="sm" className="whitespace-pre-line">
                  {message.body}
                </Typography>
              </div>
              <Typography as="span" size="xs" tone="muted">
                {mine ? "Vous" : counterpartLabel} · {message.time}
              </Typography>
            </div>
          );
        })}
      </div>
    ))}
  </div>
);
