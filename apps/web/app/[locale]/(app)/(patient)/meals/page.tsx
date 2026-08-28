import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Check,
  Clock,
  ShoppingBasket,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { formatWeekday } from "@remi/services/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Separator,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { getShoppingList, listPlannedMeals } from "@/lib/queries/meals";
import { getActivePlan } from "@/lib/queries/plans";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).meals.title };
};

/**
 * Every card carries the line "because your practitioner recommended…". That is
 * the difference between this and any recipe app: a suggestion here is traceable
 * to a consultation, and the patient can see the thread without asking.
 *
 * The page stays a server component. `Tabs` is a client primitive, but the cards
 * inside it are passed as children — they render on the server and cross the
 * boundary as markup, which is the whole reason the boundary sits there.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();
  if (!session?.personId) {
    notFound();
  }

  const content = getContent(locale).meals;
  const plan = await getActivePlan(session.personId);
  const planned = plan ? await listPlannedMeals(plan.id) : [];
  const shoppingList = plan ? await getShoppingList(plan.id) : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      {planned.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={content.empty.title}
          body={content.empty.body}
        />
      ) : (
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">{content.tabs.week}</TabsTrigger>
            <TabsTrigger value="shopping">{content.tabs.shopping}</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="flex flex-col gap-4 pt-6">
            {planned.map(({ meal, recipe }) => (
              <Card key={meal.id} elevation="flat">
                <CardHeader>
                  <CardDescription>
                    {formatWeekday(meal.servedOn, locale)} ·{" "}
                    {content.slots[meal.slot]}
                  </CardDescription>
                  <CardTitle>{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Typography tone="muted">{recipe.summary}</Typography>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral" tone="subtle" size="sm">
                      <Clock aria-hidden="true" />
                      {recipe.minutes} {content.minutes}
                    </Badge>
                    <Badge variant="neutral" tone="subtle" size="sm">
                      <Users aria-hidden="true" />
                      {recipe.servings} {content.servings}
                    </Badge>
                  </div>

                  <Separator tone="subtle" />

                  <div className="flex flex-col gap-2">
                    <Typography variant="eyebrow" tone="muted">
                      {content.because}
                    </Typography>
                    <ul className="flex flex-col gap-1">
                      {recipe.honours.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <Check
                            aria-hidden="true"
                            className="text-success-text mt-0.5 size-4 shrink-0"
                          />
                          <Typography as="span" size="sm" tone="muted">
                            {reason}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <details className="group">
                    <summary className="text-primary cursor-pointer text-sm">
                      {content.details}
                    </summary>
                    <div className="mt-3 flex flex-col gap-4">
                      <ul className="flex flex-col gap-1">
                        {recipe.ingredients.map((ingredient) => (
                          <li
                            key={ingredient.name}
                            className="flex justify-between gap-4"
                          >
                            <Typography as="span" size="sm">
                              {ingredient.name}
                            </Typography>
                            <Typography as="span" size="sm" tone="muted">
                              {ingredient.quantity}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                      <ol className="flex flex-col gap-2">
                        {recipe.method.map((instruction, index) => (
                          <li key={instruction} className="flex gap-3">
                            <Typography
                              as="span"
                              size="sm"
                              weight="medium"
                              className="text-primary shrink-0"
                            >
                              {index + 1}
                            </Typography>
                            <Typography as="span" size="sm" tone="muted">
                              {instruction}
                            </Typography>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="shopping" className="pt-6">
            <Card elevation="flat">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingBasket aria-hidden="true" className="size-4" />
                  {content.shopping.title}
                </CardTitle>
                <CardDescription>{content.shopping.body}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {shoppingList.map((group) => (
                  <div key={group.aisle} className="flex flex-col gap-2">
                    <Typography as="h3" variant="eyebrow" tone="muted">
                      {group.aisle}
                    </Typography>
                    <ul className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <li
                          key={item.name}
                          className="flex justify-between gap-4"
                        >
                          <Typography as="span" size="sm" tone="muted">
                            {item.name}
                          </Typography>
                          <Typography as="span" size="sm" tone="muted">
                            {item.quantity}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Page;
