import NextLink from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@remi/ui/server";
import type { DossierPage } from "@/lib/dossier/pages";

type Props = {
  pages: readonly DossierPage[];
};

/**
 * The dossier's table of contents, on the page that opens it. The sidebar
 * already lists the same routes, but a reader choosing where to go next needs
 * to know what each page settles — a nav label cannot carry that, and a
 * sentence can.
 */
export const PageIndex = ({ pages }: Props) => (
  <ul className="grid gap-3 md:grid-cols-2">
    {pages.map((page) => (
      <li key={page.href} className="flex">
        <NextLink
          href={page.href}
          className="focus-visible:ring-ring/40 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <Card elevation="flat" interactive className="h-full gap-3 py-5">
            <CardHeader>
              <CardTitle>{page.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{page.summary}</CardDescription>
            </CardContent>
          </Card>
        </NextLink>
      </li>
    ))}
  </ul>
);
