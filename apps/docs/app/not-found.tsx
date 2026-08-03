import { NotFoundPage } from "nextra-theme-docs";

/**
 * Next generates a `/_not-found` route whether or not an app defines one, and
 * prerenders it inside the root layout — which here is Nextra's `<Layout>`, and
 * that needs a Nextra page underneath it. Without this file the build renders a
 * bare Next 404 into that layout and the export fails.
 */
const NotFound = () => <NotFoundPage />;

export default NotFound;
