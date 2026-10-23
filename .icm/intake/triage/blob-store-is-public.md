# Stub: The Blob store is private, as D-18 and RETENTION.md promise

- lane: bug
- found-by: the privacy-policy review of the Vercel API · 2026-10-23
- complexity: low
- priority: P0

## Problem

The Vercel Blob store `document-storage` (team `remi21`, region `fra1`) reads `access: public`
in the Vercel API. D-18, `.icm/docs/ENV.md` and `.icm/docs/RETENTION.md` say the store is private.
The adapter `packages/services/src/files/adapters/vercel-blob.ts` writes with `access: "private"`
and reads only through presigned URLs. A public store gives every file a public address. The store
holds 0 files on 2026-10-23.

## Proposed change

Create a private Blob store in an EU region. Connect it to the `admin` and `app` projects, for
production and for preview. Set `BLOB_READ_WRITE_TOKEN` from the new store. Delete the public
store.

## Acceptance criteria

- [ ] The Vercel API reads `access: private` and an EU region for the connected store
- [ ] An upload from the console succeeds in production
- [ ] A file opens only through a signed URL that expires
- [ ] The public store `document-storage` no longer exists
- [ ] `ENV.md` and `RETENTION.md` stay true without an edit
