import type { Entity, Id } from "../../types";
import type {
  ProtocolRow,
  ProtocolTemplateKindName,
} from "../../shared/protocol-reuse";

export type ProtocolTemplateKind = ProtocolTemplateKindName;

/**
 * A named set of protocol rows, as stored.
 *
 * `rows` is `unknown` and that is the type doing its job: the column is a JSON
 * blob written by an older version of a row shape as readily as by this one, so
 * there is no honest way to claim it already matches. Every read goes through
 * `readProtocolRows` (`shared/protocol-reuse.ts`), which is what makes a
 * template survive a field being added or removed with no migration — and
 * typing this `ProtocolRow[]` would let a caller skip that and be wrong.
 */
export type ProtocolTemplate = Entity & {
  operatorId: Id;
  kind: ProtocolTemplateKind;
  name: string;
  rows: unknown;
  shared: boolean;
};

/**
 * A template after its rows have been read back — what every caller above the
 * service sees, and the only shape a grid is filled from.
 *
 * `owned` is resolved against the operator asking: she may rename, overwrite,
 * delete and un-share her own sets, and only insert the ones shared with her.
 * The service decides it, so no call site re-derives the comparison.
 */
export type ProtocolTemplateView = Omit<ProtocolTemplate, "rows"> & {
  rows: ProtocolRow[];
  owned: boolean;
};
