# Tasks: challenges

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `patient_challenges` exists with the columns above; a second open challenge for the same
- [ ] From the patient page Morgane creates a challenge (text, optional why, start date — a future
- [ ] Creating a challenge while one is current shows the current one with the outcome picker;
- [ ] The patient page lists the current challenge with its state and the past ones newest first
- [ ] The link's home shows « Le challenge du moment » first under « Aujourd'hui / cette semaine »,
- [ ] Each tap is saved through the `link-writes` path: attributed to the token's patient, audited
- [ ] A tap toggles; clearing « Challenge acquis » also clears « Prêt(e) pour le prochain ».
- [ ] While « Prêt(e) pour le prochain » is set on the current challenge, the at-a-glance view shows
- [ ] With no current challenge the link's card says so in the copy above; a closed challenge keeps
- [ ] The link's instruction card is titled « La consigne de la semaine » / « This week's focus »
- [ ] The service rules — one open challenge, sequential taps, clear cascade, close-and-create
- [ ] `.icm/docs/RETENTION.md` describes `patient_challenges`, its patient-written columns, its

## Queue

- [x] Schema + generated migration `0020_patient_challenges` (partial unique index) — `packages/services/src/db`
- [x] Service + in-memory tests — `packages/services/src/db/services/patient-challenges`
- [x] Audit vocabulary (7 `challenge.*` actions) + console labels/intents
- [x] Link: challenge card, taps action, loader, copy (fr/en), consigne relabel — `apps/web`
- [x] Console: challenges section, past fold, working-view card, roster badge, actions — `apps/admin`
- [x] `.icm/docs/RETENTION.md`
- [ ] Cheap-tier GREEN → merge main → flip ready → full gate GREEN
