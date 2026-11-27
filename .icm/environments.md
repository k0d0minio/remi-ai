# Where the build runs

| Environment | Address                                                   | Vercel project  | Database                                                                      | Moves on                                      |
| ----------- | --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Production  | https://app.remiai.be                                     | `app`           | the default branch of the Neon project `remi-ai`                              | `promote.sh run --tag <tag>`, on Jamie's word |
| UAT         | https://uat-app.remiai.be                                 | `app`           | the default branch of the Neon project `uat-remi-ai`                          | every merge to `main`                         |
| Preview     | the pull request's Vercel preview                         | `app`           | the shared preview database: the fixed Neon branch `preview` of `uat-remi-ai` | every push to the branch                      |
| Production  | https://admin.remiai.be                                   | `admin`         | the default branch of the Neon project `remi-ai`                              | `promote.sh run --tag <tag>`, on Jamie's word |
| UAT         | https://uat-admin.remiai.be                               | `admin`         | the default branch of the Neon project `uat-remi-ai`                          | every merge to `main`                         |
| Preview     | the pull request's Vercel preview                         | `admin`         | the shared preview database: the fixed Neon branch `preview` of `uat-remi-ai` | every push to the branch                      |
| Production  | https://remiai.be (it redirects to https://www.remiai.be) | `marketing`     | none                                                                          | every merge to `main` (D-37)                  |
| UAT         | https://uat.remiai.be                                     | `marketing`     | none                                                                          | every merge to `main`                         |
| Preview     | the pull request's Vercel preview                         | `marketing`     | none                                                                          | every push to the branch                      |
| Production  | https://docs.remiai.be                                    | `documentation` | none                                                                          | every merge to `main`. The project has no UAT |
| Preview     | the pull request's Vercel preview                         | `documentation` | none                                                                          | every push to the branch                      |

This table is the one home of where the build runs. The blueprint's files read it and never
repeat it. The blueprint owns this file: `copier update` merges a new tag into it three ways,
so a cell that a person filled stays filled.
A monorepo has one row per environment and Vercel project. Copy the rows of each environment
once for each app that deploys.
Each setup stub in `.icm/intake/setup/` names the cells that it fills.
A person fills each `<…>` cell that no setup stub fills, when the project or the domain exists.
The UAT contract: `.icm/_system/features/uat.md`.
The database contract: `.icm/_system/features/database.md`.
