import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  clearAppSetting,
  getAppSetting,
  listAppSettings,
  setAppSetting,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const arnaud = { id: "22222222-2222-4222-8222-222222222222", name: "Arnaud" };
const jamie = { id: "33333333-3333-4333-8333-333333333333", name: "Jamie" };

describe("the application settings", () => {
  it("has no row for a key that nobody set", async () => {
    expect(await getAppSetting("test.absent")).toBeNull();
    expect(await clearAppSetting("test.absent")).toBeNull();
  });

  it("sets a key, with who set it", async () => {
    const { setting, previous } = await setAppSetting("test.a", "one", arnaud);
    expect(previous).toBeNull();
    expect(setting).toMatchObject({
      key: "test.a",
      value: "one",
      updatedById: arnaud.id,
      updatedByName: "Arnaud",
    });
    expect((await getAppSetting("test.a"))?.value).toBe("one");
  });

  it("keeps one row for a key that is set again", async () => {
    const { setting, previous } = await setAppSetting("test.a", "two", jamie);
    expect(previous).toBe("one");
    expect(setting).toMatchObject({ value: "two", updatedByName: "Jamie" });
    const rows = (await listAppSettings()).filter((row) => row.key === "test.a");
    expect(rows).toHaveLength(1);
  });

  it("removes the row of a key", async () => {
    expect(await clearAppSetting("test.a")).toBe("two");
    expect(await getAppSetting("test.a")).toBeNull();
  });
});
