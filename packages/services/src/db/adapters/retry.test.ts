import { describe, expect, it } from "vitest";
import { isRead, isRetryableRead } from "./retry";

const connectionError = { type: "error" };
const postgresError = Object.assign(new Error("relation does not exist"), {
  code: "42P01",
});

describe("isRead", () => {
  it("accepts a select as a string and as a query config", () => {
    expect(isRead('select "id" from "operators"')).toBe(true);
    expect(isRead({ text: '  SELECT "id" from "operators"' })).toBe(true);
  });

  it("refuses a write, a locking select and an unknown shape", () => {
    expect(isRead('insert into "operators" default values')).toBe(false);
    expect(isRead({ text: 'update "operators" set "name" = $1' })).toBe(false);
    expect(isRead('select "id" from "operators" for update')).toBe(false);
    expect(isRead(undefined)).toBe(false);
    expect(isRead({})).toBe(false);
  });
});

describe("isRetryableRead", () => {
  it("sends a read again after a connection error", () => {
    expect(isRetryableRead({ text: "select 1" }, connectionError)).toBe(true);
    expect(isRetryableRead("select 1", new Error("Connection terminated"))).toBe(
      true,
    );
  });

  it("does not send a write again", () => {
    expect(
      isRetryableRead({ text: 'insert into "a" default values' }, connectionError),
    ).toBe(false);
  });

  it("does not send a read again when Postgres answered", () => {
    expect(isRetryableRead("select 1", postgresError)).toBe(false);
  });
});
