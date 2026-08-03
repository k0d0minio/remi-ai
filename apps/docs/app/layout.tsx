import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

/**
 * The one place in the repo that spells the brand out rather than importing it
 * from `@remi/ui/server`. next.config.ts keeps this app off the design system on
 * purpose — it is reference material, not product surface — and taking a
 * workspace dependency for two string constants would undo that for no gain.
 * The names still have to match `BRAND_NAME` / `BRAND_LEGAL_NAME`.
 */
const brandName = "REMI";
const brandLegalName = "Remi AI";

export const metadata = {
  title: { default: `${brandName} docs`, template: `%s · ${brandName} docs` },
  description: `How ${brandName} works — business direction and technical reference.`,
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en" dir="ltr" suppressHydrationWarning>
    <Head />
    <body>
      <Layout
        navbar={<Navbar logo={<strong>{brandName} docs</strong>} />}
        footer={<Footer>© {brandLegalName}</Footer>}
        pageMap={await getPageMap()}
        docsRepositoryBase="https://github.com/k0d0minio/remi-ai/tree/main/apps/docs"
      >
        {children}
      </Layout>
    </body>
  </html>
);

export default RootLayout;
