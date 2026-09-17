"use client";

import { useCallback, useRef, useState } from "react";

/**
 * The local row state behind a whole-section edit mode.
 *
 * Three sections take the same shape of editing — add a row, remove a row,
 * move one up or down, change a field — and none of it touches the server: the
 * operator rearranges her protocol freely and one submit applies the lot. That
 * is the whole point of the grid, so the state lives here once rather than
 * three times.
 *
 * Every row carries a `key` that is not its id, because a row she just added
 * has no id yet and React still needs one that survives a reorder. Ids belong
 * to the database; keys belong to this list.
 */

export type Keyed<T> = T & { key: string };

export type SectionRows<T> = {
  rows: readonly Keyed<T>[];
  addRow: () => void;
  addRows: (values: readonly T[]) => void;
  removeRow: (key: string) => void;
  moveRow: (key: string, direction: "up" | "down") => void;
  /**
   * Exchange two rows wherever they sit in the flat list. The grouped section
   * reorders with this: a group is a filter over these rows, and a filter keeps
   * their relative order, so swapping two of them reorders the group they are
   * both in without the flat list having to model the grouping at all.
   */
  swapRows: (keyA: string, keyB: string) => void;
  setField: <K extends keyof T>(key: string, name: K, value: T[K]) => void;
  reset: (values: readonly T[]) => void;
};

export const useSectionRows = <T,>(
  initial: readonly T[],
  blank: () => T,
): SectionRows<T> => {
  const nextKey = useRef(0);
  const withKeys = useCallback((values: readonly T[]): Keyed<T>[] => {
    return values.map((value) => {
      nextKey.current += 1;
      return { ...value, key: `row-${nextKey.current}` };
    });
  }, []);

  const [rows, setRows] = useState<Keyed<T>[]>(() => withKeys(initial));

  const addRows = useCallback(
    (values: readonly T[]) => {
      setRows((current) => [...current, ...withKeys(values)]);
    },
    [withKeys],
  );

  const moveRow = useCallback((key: string, direction: "up" | "down") => {
    setRows((current) => {
      const index = current.findIndex((row) => row.key === key);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || target < 0 || target >= current.length) {
        return current;
      }
      const reordered = [...current];
      reordered[index] = current[target];
      reordered[target] = current[index];
      return reordered;
    });
  }, []);

  const swapRows = useCallback((keyA: string, keyB: string) => {
    setRows((current) => {
      const a = current.findIndex((row) => row.key === keyA);
      const b = current.findIndex((row) => row.key === keyB);
      if (a === -1 || b === -1) {
        return current;
      }
      const reordered = [...current];
      reordered[a] = current[b];
      reordered[b] = current[a];
      return reordered;
    });
  }, []);

  const addRow = useCallback(() => addRows([blank()]), [addRows, blank]);

  const removeRow = useCallback((key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  }, []);

  const setField = useCallback(
    <K extends keyof T>(key: string, name: K, value: T[K]) => {
      setRows((current) =>
        current.map((row) => {
          if (row.key !== key) {
            return row;
          }
          const next: Keyed<T> = { ...row };
          next[name] = value;
          return next;
        }),
      );
    },
    [],
  );

  const reset = useCallback(
    (values: readonly T[]) => setRows(withKeys(values)),
    [withKeys],
  );

  return {
    rows,
    addRow,
    addRows,
    removeRow,
    moveRow,
    swapRows,
    setField,
    reset,
  };
};
