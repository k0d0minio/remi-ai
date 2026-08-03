import { Skeleton, VisuallyHidden } from "@remi/ui/server";

/**
 * The entry screen's split, in grey. It mirrors the real layout closely enough
 * that nothing moves when the page arrives.
 *
 * One string in both languages because a loading boundary receives no params —
 * there is no locale here to pick a dictionary with.
 */
const Loading = () => (
  <div
    role="status"
    aria-live="polite"
    className="grid min-h-dvh lg:grid-cols-2"
  >
    <VisuallyHidden>Loading · Chargement</VisuallyHidden>

    <div className="bg-primary-subtle hidden flex-col justify-center gap-10 border-r p-12 lg:flex xl:p-16">
      <Skeleton className="h-8 w-28" />
      <div className="flex max-w-lg flex-col gap-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="mt-2 h-5 w-3/4" />
      </div>
    </div>

    <div className="flex items-center justify-center px-6 py-12 sm:px-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Skeleton className="h-6 w-20 lg:hidden" />
        <div className="bg-card flex flex-col gap-6 rounded-xl border p-6 shadow-md">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Loading;
