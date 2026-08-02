import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import { PlaceholderScreen } from "@/components/shell/placeholder-screen";
import { getContent } from "@/lib/content";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return { title: getContent(locale).placeholders.practice.title };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale);

  return (
    <PlaceholderScreen
      screen={content.placeholders.practice}
      content={content}
    />
  );
};

export default Page;
