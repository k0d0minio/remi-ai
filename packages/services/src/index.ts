/**
 * @remi/services — root barrel, deliberately types-only.
 *
 * Apps never import this path (ESLint blocks it): they name the entrypoint that
 * matches where their code runs — `/shared`, `/server`, `/ai`, `/email`. The root
 * exists so tooling that resolves the package name gets the vocabulary, and so
 * importing it can never pull a Node-only module into a client bundle.
 */

export type { Actor, Entity, Id, Page, PageQuery, Timestamped } from "./types";
export type { Result, ServiceErrorCode } from "./shared/result";
