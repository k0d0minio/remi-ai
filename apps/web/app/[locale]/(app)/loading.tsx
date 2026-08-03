import { Skeleton, VisuallyHidden } from "@remi/ui/server";

/**
 * Here so the signed-in routes keep a fallback of their own. Without it the
 * nearest boundary above is `[locale]/loading.tsx`, which sits outside this
 * layout — every navigation inside the app would replace the shell with the
 * entry screen's skeleton.
 */
const Loading = () => (
  <div role="status" aria-live="polite" className="flex flex-col gap-6">
    <VisuallyHidden>Loading · Chargement</VisuallyHidden>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-lg" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

export default Loading;
