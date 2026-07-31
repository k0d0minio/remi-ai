import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: { default: "Remi AI docs", template: "%s · Remi AI docs" },
  description:
    "How Remi AI works — business direction and technical reference.",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en" dir="ltr" suppressHydrationWarning>
    <Head />
    <body>
      <Layout
        navbar={<Navbar logo={<strong>Remi AI docs</strong>} />}
        footer={<Footer>Remi AI</Footer>}
        pageMap={await getPageMap()}
        docsRepositoryBase="https://github.com/k0d0minio/remi-ai/tree/main/apps/docs"
      >
        {children}
      </Layout>
    </body>
  </html>
);

export default RootLayout;
