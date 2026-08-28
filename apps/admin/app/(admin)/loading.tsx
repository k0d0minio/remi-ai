import { Card, CardContent, Skeleton, VisuallyHidden } from "@remi/ui/server";

const rows = ["first", "second", "third", "fourth", "fifth"];

/**
 * Inside the route group rather than beside the root layout: a loading file at
 * the root would blank the sidebar and header too, and a console that loses its
 * chrome on every navigation reads as a page reload.
 *
 * Deliberately generic — a heading, then a list of rows. Every page in this
 * console is one of those, and a skeleton shaped for one of them flashes the
 * wrong silhouette on the other four.
 */
const Loading = () => (
  <div role="status" aria-busy="true" className="flex flex-col gap-8">
    <VisuallyHidden>Chargement de la console</VisuallyHidden>

    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>

    <Card elevation="flat">
      <CardContent className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Loading;
