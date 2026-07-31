/**
 * @remi/services/shared — the isomorphic surface.
 *
 * Everything here runs unchanged in a browser bundle and on the server: types,
 * formatters, validation schemas, pure helpers. No filesystem, no database
 * driver, no secret read. If a module cannot honestly claim that, it belongs
 * under /server instead.
 */

export { formatCurrency, formatDate, formatDateTime, initials } from "./format";
export { err, ok, unwrap } from "./result";
export type { Result, ServiceErrorCode } from "./result";
export type { Actor, Entity, Id, Page, PageQuery, Timestamped } from "../types";
