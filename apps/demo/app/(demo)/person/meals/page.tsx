import type { Metadata } from "next";
import { Check, Clock, ShoppingBasket, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Typography,
} from "@remi/ui/server";
import { recipes, shoppingList } from "@/lib/mock/meals";

export const metadata: Metadata = { title: "Repas" };

/**
 * Every card carries the line "parce que votre praticien a recommandé…". That
 * is the difference between this and any recipe app: a suggestion here is
 * traceable to a consultation, and the person can see the thread without asking.
 */
const Page = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Repas
      </Typography>
      <Typography tone="muted">
        Des idées qui suivent votre plan, adaptées à vos goûts, votre temps et
        ce que vous avez en cuisine.
      </Typography>
    </div>

    <Tabs defaultValue="week">
      <TabsList>
        <TabsTrigger value="week">La semaine</TabsTrigger>
        <TabsTrigger value="shopping">Liste de courses</TabsTrigger>
      </TabsList>

      <TabsContent value="week" className="flex flex-col gap-4 pt-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} elevation="flat" className="border-border">
            <CardHeader>
              <CardDescription>
                {recipe.day} · {recipe.slot}
              </CardDescription>
              <CardTitle>{recipe.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Typography tone="muted">{recipe.summary}</Typography>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral" tone="subtle" size="sm">
                  <Clock aria-hidden="true" />
                  {recipe.minutes} min
                </Badge>
                <Badge variant="neutral" tone="subtle" size="sm">
                  <Users aria-hidden="true" />
                  {recipe.servings}
                </Badge>
              </div>

              <Separator tone="subtle" />

              <div className="flex flex-col gap-2">
                <Typography variant="eyebrow" tone="muted">
                  Parce que votre praticien a recommandé
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
                  Ingrédients et préparation
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
        <Card elevation="flat" className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBasket aria-hidden="true" className="size-4" />
              Samedi, avant les courses
            </CardTitle>
            <CardDescription>
              Rangée comme le magasin, pas comme les recettes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {shoppingList.map((group) => (
              <div key={group.aisle} className="flex flex-col gap-2">
                <Typography as="h3" variant="eyebrow" tone="muted">
                  {group.aisle}
                </Typography>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Typography size="sm" tone="muted">
                        {item}
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
  </div>
);

export default Page;
