/**
 * The two paths into a practitioner-created file (`patient-takes-over-file`,
 * story 1). Isomorphic and import-free: the admin app builds the activation
 * link with it, the web app routes the page with it.
 *
 * - `activation`: the link in « Votre espace REMI est prêt »
 *   (`care-activation/activation-email`).
 * - `claim`: the link a patient asks for when a sign-up finds their e-mail on
 *   a file that has no account yet.
 */
export const fileClaimPurposes = ["activation", "claim"] as const;

export type FileClaimPurpose = (typeof fileClaimPurposes)[number];

/** The takeover page, without the locale prefix. */
export const fileTakeoverPath = (token: string) =>
  `/inscription/reprendre/${encodeURIComponent(token)}`;
