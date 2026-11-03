import { Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { HERO, MOCK } from "@/lib/content/landing";

/** The previews of the app, in HTML. Fictional content, from `content/landing.ts`. */

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

export const ImproveMock = () => (
  <div
    aria-label={MOCK.improve.label}
    className="bg-primary-subtle flex flex-col gap-2 rounded-xl p-3 text-[0.8125rem]"
  >
    <p className="bg-primary text-primary-foreground max-w-[90%] self-end rounded-[14px_14px_4px_14px] px-3 py-2 font-semibold">
      {MOCK.improve.input}
    </p>
    <ul className="flex flex-wrap gap-1.5">
      {MOCK.improve.suggestions.map((suggestion) => (
        <li
          key={suggestion}
          className="bg-background text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold"
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {suggestion}
        </li>
      ))}
    </ul>
    <p className="text-muted-foreground">{MOCK.improve.why}</p>
  </div>
);

/** The phone of the hero: the « today » screen with the logo. */
export const PhoneMock = () => (
  <div
    role="img"
    aria-label={HERO.phone.label}
    className="bg-foreground mx-auto w-[270px] rotate-2 rounded-[38px] p-2.5 shadow-2xl"
  >
    <div className="bg-background flex flex-col gap-3 rounded-[29px] px-4 pt-5 pb-4">
      <Logo height={22} />
      <p className="text-[0.9375rem] font-bold">{HERO.phone.title}</p>
      <RecipesMock />
      <p className="bg-brand-gradient rounded-full p-2.5 text-center text-[0.8125rem] font-bold text-white">
        {HERO.phone.cta}
      </p>
    </div>
  </div>
);
