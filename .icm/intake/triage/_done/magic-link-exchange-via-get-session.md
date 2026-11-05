# Stub: The magic link still lands without a session

- lane: bug
- found-by: UAT test of uat-app.remiai.be after #186 · 2026-11-05
- complexity: low
- priority: P0

## Problem

After #186, the magic link still opens `/fr/connexion` with no session.

#186 exchanges the verifier through the SDK's middleware. The middleware exchanges a verifier only
when the request also carries the challenge cookie. That cookie belongs to the OAuth flow. Neon Auth
sets no challenge cookie for a magic link, so the middleware never exchanges and the route opens the
sign-in page.

Checked on UAT, 2026-11-05: a fresh verifier sent to `/api/auth/get-session` through the app's own
auth proxy returns the two session cookies on `uat-app.remiai.be` and the patient's user. The
browser SDK completes a magic link the same way.

## Proposed change

In the Neon adapter, exchange the verifier through the mounted auth handler's `get-session`, not
through the middleware. Remove the middleware from the adapter. Correct `.icm/docs/ENV.md`.

## Acceptance criteria

- [ ] On UAT, a magic link opened in the browser that asked for it signs the patient in and opens `/fr/questionnaire`.
- [ ] A used or expired link opens `/fr/connexion` with no session.
- [ ] `.icm/docs/ENV.md` describes the exchange as it runs.
