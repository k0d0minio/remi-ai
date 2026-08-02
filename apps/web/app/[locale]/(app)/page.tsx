import { redirect } from "next/navigation";
import { localePath, type Locale } from "@remi/services/shared";
import { getSession } from "@/lib/auth/session";

type Params = { locale: Locale };

/**
 * The root of the signed-in app has no screen of its own — which side of the
 * loop you are on decides where you land. It lives here rather than in either
 * route group because two sibling groups cannot both own `/`.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const session = await getSession();

  redirect(
    localePath(locale, session?.role === "person" ? "/today" : "/clients"),
  );
};

export default Page;
