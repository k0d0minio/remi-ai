import { MOCK } from "@/lib/content/landing";

/** The preview of the day's recipes, in HTML. Fictional content, from `content/landing.ts`. */
export const RecipesMock = () => (
  <ul
    aria-label={MOCK.mealsLabel}
    className="bg-primary-subtle flex flex-col gap-2 rounded-xl p-3 text-[0.8125rem]"
  >
    {MOCK.meals.map((meal) => (
      <li key={meal.slot} className="bg-background flex flex-col rounded-lg px-2.5 py-2">
        <span className="text-success-text text-[0.6875rem] font-bold tracking-wider uppercase">
          {meal.slot}
        </span>
        <span className="font-semibold">{meal.name}</span>
      </li>
    ))}
  </ul>
);
