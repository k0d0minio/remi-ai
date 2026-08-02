import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/**
 * Plain table elements, so the whole family stays server-safe. The horizontal
 * scroll lives on a wrapper rather than the table itself — a table that clips
 * its own overflow loses columns silently on a narrow screen.
 */
export const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <div data-slot="table-wrapper" className="w-full overflow-x-auto">
    <table
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
);

export const TableHeader = ({
  className,
  ...props
}: ComponentProps<"thead">) => (
  <thead
    data-slot="table-header"
    className={cn("[&_tr]:border-border [&_tr]:border-b", className)}
    {...props}
  />
);

export const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => (
  <tbody
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
);

export const TableRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr
    data-slot="table-row"
    className={cn(
      "border-border hover:bg-accent/50 border-b transition-colors duration-[--duration-fast]",
      className,
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
  <th
    data-slot="table-head"
    className={cn(
      "text-muted-foreground h-10 whitespace-nowrap px-3 text-left align-middle text-xs font-medium",
      className,
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: ComponentProps<"td">) => (
  <td
    data-slot="table-cell"
    className={cn("px-3 py-3 align-middle", className)}
    {...props}
  />
);

export const TableCaption = ({
  className,
  ...props
}: ComponentProps<"caption">) => (
  <caption
    data-slot="table-caption"
    className={cn("text-muted-foreground mt-4 text-sm", className)}
    {...props}
  />
);
