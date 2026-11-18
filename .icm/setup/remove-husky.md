# Setup: remove husky

- where: this repo, in the pull request of the blueprint render or update
- why: CI is the source of truth (J, 2026-11-17). A git hook adds an install step to each
  commit of a session, and `--no-verify` skips it. The CI of the repo does the lint.

## Steps

1. Remove the folder `.husky/`.
2. In `package.json`, remove the script `prepare` when it only runs husky.
3. Remove the package `husky`.
4. When only the hook used `lint-staged`, remove the package and its configuration: the
   key `lint-staged` of `package.json`, or a `.lintstagedrc*` or `lint-staged.config.*` file.
5. Install again, and commit the new lockfile with the removal.
6. In each clone of the repo: `git config --unset core.hooksPath`.

## Done when

- [ ] The default branch has no `.husky/` folder and no `husky` package.
- [ ] CI is green on the pull request of the removal.
