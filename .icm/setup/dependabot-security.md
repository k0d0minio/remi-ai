# Setup: Dependabot security updates

- where: GitHub → the repo → Settings → Code security

## Steps

1. Turn on "Dependabot alerts".
2. Turn on "Dependabot security updates".
3. Read `.github/dependabot.yml`. It stops the version updates. Keep it, or write your own.

## Done when

- [ ] Dependabot opens a pull request for a dependency with a known vulnerability.
  J, 2026-11-27: no. Dependabot stays off.
