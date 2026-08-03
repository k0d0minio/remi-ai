import { Card, CardContent, Skeleton, VisuallyHidden } from "@remi/ui/server";

const tiles = ["cohort", "patients", "plans", "signals"];
const rows = ["first", "second", "third", "fourth"];

/**
 * Inside the route group rather than beside the root layout: a loading file at
 * the root would blank the sidebar and header too, and a console that loses its
 * chrome on every navigation reads as a page reload.
 */
const Loading = () => (
  <div role="status" aria-busy="true" className="flex flex-col gap-8">
    <VisuallyHidden>Loading the operations console</VisuallyHidden>

    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile} elevation="flat" className="gap-0 py-5">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card elevation="flat">
        <CardContent className="flex flex-col gap-5">
          {rows.map((row) => (
            <div key={row} className="flex gap-4">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card elevation="flat">
        <CardContent className="flex flex-col gap-5">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Loading;
