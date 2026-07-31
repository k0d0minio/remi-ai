import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const tabsList = cva("inline-flex items-center", {
  variants: {
    variant: {
      underline: "gap-6 border-b border-border",
      pill: "bg-muted gap-1 rounded-lg p-1",
    },
  },
  defaultVariants: { variant: "underline" },
});

const tabsTrigger = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors duration-[--duration-fast] ease-standard outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        underline:
          "text-muted-foreground -mb-px rounded-t-sm border-b-2 border-transparent px-1 py-3 hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
        pill: "text-muted-foreground rounded-md px-3 py-1.5 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

export const Tabs = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root
    data-slot="tabs"
    className={cn("flex flex-col gap-6", className)}
    {...props}
  />
);

type ListProps = ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsList>;

export const TabsList = ({ className, variant, ...props }: ListProps) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    className={cn(tabsList({ variant }), className)}
    {...props}
  />
);

type TriggerProps = ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTrigger>;

export const TabsTrigger = ({ className, variant, ...props }: TriggerProps) => (
  <TabsPrimitive.Trigger
    data-slot="tabs-trigger"
    className={cn(tabsTrigger({ variant }), className)}
    {...props}
  />
);

export const TabsContent = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    data-slot="tabs-content"
    className={cn(
      "focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]",
      className,
    )}
    {...props}
  />
);
