import type { Locale } from "@remi/services/shared";
import { fr } from "./fr";
import type { Content } from "./types";

const dictionaries: Record<Locale, Content> = { fr };

export const getContent = (locale: Locale): Content => dictionaries[locale];

export type { Content } from "./types";
