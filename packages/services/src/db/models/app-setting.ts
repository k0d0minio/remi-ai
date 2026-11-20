import type { Entity, Id } from "../../types";

/**
 * One setting of the application that an admin changed in the console. A key
 * with no row has its code default. The table holds no secret and no patient
 * data.
 *
 * `updatedAt` is when the value was set. `updatedById` has no foreign key: the
 * record of who set a value stays when the account is removed.
 */
export type AppSetting = Entity & {
  key: string;
  value: string;
  updatedById: Id | null;
  updatedByName: string;
};
