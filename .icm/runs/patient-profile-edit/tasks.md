# Tasks: patient-profile-edit

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] The patient link lists a « Mon profil » segment; opening it with a valid token shows the seven editable fields prefilled with the current values, and name, age, height and weight read-only
- [ ] The segment never shows the birth date, constraints, referral, consent, anamnesis, medications or supplements
- [ ] Saving changed values through « Mon profil » persists them, and the change appears on the console's profile read summary on reload
- [ ] Each accepted save records one audit event whose actor is the patient and stamps the profile's last-written timestamp; a save with no change records neither
- [ ] A save over the link rate limit or over a length cap is refused with a message on the segment, the typed values stay in the form, and nothing is persisted
- [ ] An unknown or regenerated token on `/p/[token]/profil` returns the same not-found as every other segment, for both the page and the save
- [ ] The patient can clear or remove an allergy, and the console then shows « modifié par la patiente le <date> » on Allergies
- [ ] The console's profile read summary shows « modifié par la patiente le <date> » on each of the seven fields the patient last changed, and not on fields Morgane saved after the patient
- [ ] « Temps disponible pour cuisiner » (faible / moyen / important) and « Budget alimentaire » (économique / standard / confort) are selects on both the patient segment and the admin patient form, each with an unset option
- [ ] After the migration, an existing `food_budget` naming a level holds that level, and any other existing non-empty value appears in `preferences` as « Budget : <original text> » with the budget unset
- [ ] The copy-context export shows « Aime cuisiner », « Temps disponible pour cuisiner » and « Budget » as their French three-level labels
- [ ] RETENTION.md lists `cooking_time` and the per-field patient-edit dates, with what reaches the link

## Queue

- [ ] <task — small enough for one commit; name the file or area>
