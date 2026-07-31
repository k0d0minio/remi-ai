/**
 * The vocabulary every other module in this package is written against.
 *
 * These types are deliberately storage-agnostic — nothing here names a database,
 * an ORM, or an auth provider. Picking one later means writing an adapter under
 * /db that satisfies these shapes, not rewriting the callers.
 */

export type Id = string;

export type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

export type Entity = Timestamped & { id: Id };

/** Who is asking. Every /server call takes one; the auth provider fills it in. */
export type Actor = {
  id: Id;
  email: string;
  roles: readonly string[];
};

export type PageQuery = {
  limit?: number;
  cursor?: string | null;
};

export type Page<T> = {
  items: readonly T[];
  nextCursor: string | null;
};
