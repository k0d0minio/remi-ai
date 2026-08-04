import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import { CategoryGrid } from "@/components/sections/category-grid";
import { ContactCta } from "@/components/sections/contact-cta";
import { PopularArticles } from "@/components/sections/popular-articles";
import { SearchHero } from "@/components/sections/search-hero";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).home;
  return buildMetadata({ ...meta, path: "/", locale });
};

// `const Page` rather than `export default function`: prefer-arrow is a warning
// and CI runs with --max-warnings=0, with no exemption for route files.
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const { home, categories } = getContent(locale);

  return (
    <>
      <SearchHero content={home.hero} />
      <CategoryGrid
        content={home.categories}
        categories={categories}
        locale={locale}
      />
      <PopularArticles
        content={home.popular}
        categories={categories}
        locale={locale}
      />
      <ContactCta content={home.cta} locale={locale} />
    </>
  );
};

export default Page;
