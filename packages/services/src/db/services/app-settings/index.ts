import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { AppSetting } from "../../models/app-setting";

/**
 * The storage of the application settings: one row for each key that an admin
 * set. This file checks no permission and no value. The service that owns a
 * key does both (`server/ai-models` for the models of the AI roles).
 */

const settings = () => getDatabase().collection<AppSetting>("app_settings");

/** The table has a few rows. One read serves the page. */
const PAGE = 100;

export type SettingAuthor = { id: Id; name: string };

export const getAppSetting = async (key: string): Promise<AppSetting | null> => {
  const page = await settings().findMany({ key }, { limit: 1 });
  return page.items[0] ?? null;
};

export const listAppSettings = async (): Promise<readonly AppSetting[]> => {
  const page = await settings().findMany({}, { limit: PAGE });
  return page.items;
};

/** Set the value of a key. It returns the row, and the value before. */
export const setAppSetting = async (
  key: string,
  value: string,
  by: SettingAuthor,
): Promise<{ setting: AppSetting; previous: string | null }> => {
  const existing = await getAppSetting(key);
  const author = { updatedById: by.id, updatedByName: by.name };
  if (existing) {
    const updated = await settings().update(existing.id, { value, ...author });
    if (updated) {
      return { setting: updated, previous: existing.value };
    }
  }
  const setting = await settings().insert({ key, value, ...author });
  return { setting, previous: null };
};

/** Remove the row of a key. It returns the value before, or null. */
export const clearAppSetting = async (key: string): Promise<string | null> => {
  const existing = await getAppSetting(key);
  if (!existing) {
    return null;
  }
  await settings().remove(existing.id);
  return existing.value;
};
