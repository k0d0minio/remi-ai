import type { Locale } from "@remi/services/shared";
import { en } from "./en";
import { fr } from "./fr";
import type { Content } from "./types";

const dictionaries: Record<Locale, Content> = { en, fr };

export const getContent = (locale: Locale): Content => dictionaries[locale];

export type { Content } from "./types";
