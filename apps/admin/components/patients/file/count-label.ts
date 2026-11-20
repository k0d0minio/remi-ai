type Words = {
  /** « Aucun objectif ». */
  none: string;
  /** The singular noun: « objectif ». */
  one: string;
  /** The plural noun: « objectifs ». */
  many: string;
};

/** A count as one short line: « Aucun objectif », « 1 objectif », « 3 objectifs ». */
export const countLabel = (count: number, words: Words) =>
  count === 0
    ? words.none
    : count === 1
      ? `1 ${words.one}`
      : `${count} ${words.many}`;
