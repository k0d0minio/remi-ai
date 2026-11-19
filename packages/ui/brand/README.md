# Brand — the design reference

The source files of the REMI brand, as Morgane delivered them on 2 November 2026, and the
derived files the apps serve. `src/tokens.css` is the palette in code and `src/lib/brand.ts`
holds the names and the hex values. This folder holds the pictures. Nothing here is imported
by code: an app copies the file it serves into its own `public/` folder.

[`charte-graphique.md`](charte-graphique.md) is Morgane's brand and design charter of
16 November 2026, in her words. It is the reference for the colours, the typeface, the shapes,
the components and the tone of voice. `logo/remi-logo-charte.png` is the logo as the charter
shows it (725 × 229). Where this file and the charter differ, the charter is the newer statement.

## Files

| File                            | Is                                                                                                   | Served by                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `logo/remi-logo-1024.png`       | The logo as delivered: 1024 × 1024, near-white background. The only original.                        | —                                                              |
| `logo/remi-logo.png`            | The wordmark cropped from the original, background made transparent. 693 × 240.                      | `apps/marketing/public/brand/`, `apps/docs/public/` (at 560 px) |
| `logo/remi-mark.png`            | The R of the wordmark alone, on a transparent square. The favicon.                                   | `apps/marketing/app/icon.png` and `apple-icon.png`             |
| `portraits/morgane-paquet.jpg`  | Portrait, 800 × 800.                                                                                 | `apps/marketing/public/team/` (at 640 px)                      |
| `portraits/arnaud-ruelle.png`   | Portrait, 800 × 800.                                                                                 | `apps/marketing/public/team/` (at 640 px, JPEG)                |
| `portraits/jamie-nisbet.jpg`    | Portrait, 454 × 454.                                                                                 | `apps/marketing/public/team/`                                  |
| `visuals/hero.png`              | The hero visual: a woman with a phone inside a blue ring, with food and activity icons. 1386 × 780.  | nothing yet                                                    |
| `visuals/phone-mockup.png`      | A phone mockup of the app. 1362 × 1362. The screens in it are fictional.                             | nothing yet                                                    |
| `visuals/woman-with-phone.png`  | The woman of the hero visual alone, transparent background. 2476 × 1651.                             | nothing yet                                                    |

Some of the visuals may be AI-generated. Check the rights of use before one of them is served
on a public page.

The visuals are for communication only: the public site, e-mails, presentations and social
networks. The charter (sections 7 and 9) says that the application uses no photo and no
illustration in the MVP. Do not serve a file of `visuals/` or `portraits/` from `apps/web` or
`apps/admin`. On 19 November 2026 these two apps serve no photo and no illustration.

## The palette and the typeface

The charter is the one home of the values: [`charte-graphique.md`](charte-graphique.md), section 3
for the colours of the four letters of the logo, section 4 for the design tokens and section 5 for
the typeface (Plus Jakarta Sans, weights 400 to 800). `src/tokens.css` holds the same values in
code. This file repeats none of them.

The wordmark is always the image, never typed.

## Why a logo is a PNG here

No vector file exists. A vector or a higher-definition export would replace `remi-logo-1024.png`
and the derived files would be cut again from it. The derived files were cut with Pillow: a
colour-to-alpha pass against the original's background, then a crop to the letters.
