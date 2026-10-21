# .icm — the work layer

The map of this folder. The tickets, the two scripts that start and finish them, and the
documents that say what Remi is. The loop from stub to merge is `intake/CONTEXT.md`, the
blueprint's contract.

```
.icm/
  CONTEXT.md        this map
  project.md        the register: what Remi is for, its business rules, its decisions
  intake/           the tickets: epics with a breakdown and stubs, triage, _done/
    CONTEXT.md      the contract: formats, writing rules, the loop
    README.md       this backlog: the epics in order, the decisions of record
  scripts/
    new-run.sh      start a ticket: branch, stub into _done/, draft pull request
    close-out.sh    after the last stub: the epic folder into _done/
  docs/             what Remi is (README.md names the precedence), ENV.md, RETENTION.md
```

The old pipeline (stages, lanes, runs, the shared doctrine, 45 scripts, the skills) left this
folder on 2026-10-21. Git history holds it.
