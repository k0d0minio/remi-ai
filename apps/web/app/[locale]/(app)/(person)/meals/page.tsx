import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/shell/placeholder-screen";
import { getContent } from "@/lib/content";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).placeholders.meals.title };
};

const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const content = getContent(locale);

  return (
    <PlaceholderScreen screen={content.placeholders.meals} content={content} />
  );
};

export default Page;
