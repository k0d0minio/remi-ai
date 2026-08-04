import { Skeleton, VisuallyHidden } from "@remi/ui/server";

/**
 * Inside the route group rather than beside the root layout: a loading file at
 * the root would blank the sidebar and the surface switcher too, and a
 * prototype that loses its chrome between screens reads as a broken build to
 * the stakeholder reviewing it.
 */
const Loading = () => (
  <div role="status" aria-busy="true" className="flex flex-col gap-6">
    <VisuallyHidden>Chargement</VisuallyHidden>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-lg" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

export default Loading;
