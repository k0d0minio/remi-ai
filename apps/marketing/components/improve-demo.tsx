"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@remi/ui";
import { MOCK } from "@/lib/content/landing";

const copy = MOCK.improve;

/**
 * The interactive preview of « Améliorez vos repas »: three meals as chips,
 * the chosen one as a message sent to REMI, its three suggestions as replies.
 * Radix mounts only the active panel, so the fade-in plays again at each
 * change of meal. Fictional content, from `content/landing.ts`.
 */
export const ImproveDemo = () => (
  <Tabs
    defaultValue={copy.meals[0].id}
    aria-label={copy.label}
    className="bg-primary-subtle gap-3 rounded-xl p-3 text-[0.8125rem]"
  >
    <TabsList
      aria-label={copy.pickLabel}
      variant="pill"
      className="flex-wrap gap-1.5 bg-transparent p-0"
    >
      {copy.meals.map((meal) => (
        <TabsTrigger
          key={meal.id}
          value={meal.id}
          variant="pill"
          className="bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1.5 font-semibold"
        >
          <span aria-hidden="true">{meal.emoji}</span>
          {meal.name}
        </TabsTrigger>
      ))}
    </TabsList>
    {copy.meals.map((meal) => (
      <TabsContent
        key={meal.id}
        value={meal.id}
        className="animate-fade-in flex flex-col gap-2"
      >
        <p className="bg-primary text-primary-foreground max-w-[90%] self-end rounded-[14px_14px_4px_14px] px-3 py-2 font-semibold">
          {meal.message}
        </p>
        <ol className="flex flex-col gap-1.5">
          {meal.suggestions.map((suggestion) => (
            <li
              key={suggestion.action}
              className="bg-background flex max-w-[92%] flex-col gap-0.5 rounded-[14px_14px_14px_4px] px-3 py-2"
            >
              <span className="text-primary font-semibold">
                {suggestion.action}
              </span>
              <span className="text-muted-foreground">{suggestion.why}</span>
            </li>
          ))}
        </ol>
      </TabsContent>
    ))}
  </Tabs>
);
