# Where the build runs

| Environment | Address | Vercel project | Database | Moves on |
|---|---|---|---|---|
| Production | https://app.remiai.be, https://app.remi-ai.tech | `app` | the default branch of the Neon project `remi-ai` | `promote.sh run --tag <tag>`, on Jamie's word |
| UAT | https://uat-app.remiai.be | `app` | the default branch of the Neon project `uat-remi-ai` | every merge to `main` |
| Preview | the pull request's Vercel preview | `app` | the Neon branch `preview/<branch>` in `uat-remi-ai`, made by the Neon integration | every push to the branch |
| Production | https://admin.remi-ai.tech | `admin` | the default branch of the Neon project `remi-ai` | `promote.sh run --tag <tag>`, on Jamie's word |
| UAT | https://uat-admin.remiai.be | `admin` | the default branch of the Neon project `uat-remi-ai` | every merge to `main` |
| Preview | the pull request's Vercel preview | `admin` | the Neon branch `preview/<branch>` in `uat-remi-ai`, made by the Neon integration | every push to the branch |
| Production | https://remi-ai.tech | `marketing` | none | <no custom environment `uat` on the project: every merge to `main` or `promote.sh`, Jamie confirms> |
| UAT | <no custom environment `uat` on the Vercel project on 2026-10-29> | `marketing` | none | every merge to `main` |
| Preview | the pull request's Vercel preview | `marketing` | none | every push to the branch |
| Production | https://docs.remi-ai.tech | `documentation` | none | <no custom environment `uat` on the project: every merge to `main` or `promote.sh`, Jamie confirms> |
| UAT | <no custom environment `uat` on the Vercel project on 2026-10-29> | `documentation` | none | every merge to `main` |
| Preview | the pull request's Vercel preview | `documentation` | none | every push to the branch |

This table is the one home of where the build runs. The blueprint's files read it and never
repeat it. The blueprint owns this file: `copier update` merges a new tag into it three ways,
so a cell that a person filled stays filled.
A monorepo has one row per environment and Vercel project. Copy the rows of each environment
once for each app that deploys.
Each setup stub in `.icm/intake/setup/` names the cells that it fills.
A person fills each `<…>` cell that no setup stub fills, when the project or the domain exists.
The UAT contract: `.icm/uat/CONTEXT.md`.
The database contract: `.icm/database/CONTEXT.md`.
