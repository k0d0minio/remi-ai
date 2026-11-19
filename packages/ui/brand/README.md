# Brand — the design reference

The source files of the REMI brand, as Morgane delivered them on 2 November 2026, and the
derived files the apps serve. `src/tokens.css` is the palette in code and `src/lib/brand.ts`
holds the names and the hex values. This folder holds the pictures. Nothing here is imported
by code: an app copies the file it serves into its own `public/` folder.

[`charte-graphique.md`](charte-graphique.md) is Morgane's brand and design charter of
16 November 2026, in her words. It is the reference for the colours, the typeface, the shapes,
the components and the tone of voice. `logo/remi-logo-charte.png` is the logo as the charter
shows it (725 × 229). Where this file and the charter differ, the charter is the newer statement.
The palette table below and the sentence "Text is set in Inter" describe the code of today, not
the charter.

## Files

| File                           | Is                                                                                                  | Served by                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `logo/remi-logo-1024.png`      | The logo as delivered on 2 November: 1024 × 1024, near-white background, a gradient.                | —                                                               |
| `logo/remi-logo-charte.png`    | The logo as the charter shows it: 725 × 229, white background, flat colours. The reference.         | —                                                               |
| `logo/remi-logo.png`           | The charter logo with a transparent background. 725 × 229.                                          | `apps/{web,admin,marketing}/public/brand/`, `apps/docs/public/` |
| `logo/remi-mark.png`           | The R of the charter logo alone, on a transparent square. 230 × 230.                                | —                                                               |
| `logo/remi-icon.png`           | The R on a white rounded square. 256 × 256. The favicon.                                            | `app/icon.png` of the four apps                                 |
| `logo/remi-apple-icon.png`     | The R on a white square with no radius. 180 × 180.                                                  | `app/apple-icon.png` of the four apps                           |
| `portraits/morgane-paquet.jpg` | Portrait, 800 × 800.                                                                                | `apps/marketing/public/team/` (at 640 px)                       |
| `portraits/arnaud-ruelle.png`  | Portrait, 800 × 800.                                                                                | `apps/marketing/public/team/` (at 640 px, JPEG)                 |
| `portraits/jamie-nisbet.jpg`   | Portrait, 454 × 454.                                                                                | `apps/marketing/public/team/`                                   |
| `visuals/hero.png`             | The hero visual: a woman with a phone inside a blue ring, with food and activity icons. 1386 × 780. | nothing yet                                                     |
| `visuals/phone-mockup.png`     | A phone mockup of the app. 1362 × 1362. The screens in it are fictional.                            | nothing yet                                                     |
| `visuals/woman-with-phone.png` | The woman of the hero visual alone, transparent background. 2476 × 1651.                            | nothing yet                                                     |

Some of the visuals may be AI-generated. Check the rights of use before one of them is served
on a public page.

## The palette the logo gives

The wordmark is a gradient from blue to teal. The tokens follow it:

| Colour              | Hex       | Token                                     |
| ------------------- | --------- | ----------------------------------------- |
| Blue, the R         | `#045cc7` | `--brand-600`, the primary                |
| Blue, the M         | `#0a7ad8` | the middle stop of `--gradient-brand`     |
| Teal, the I         | `#00a7a8` | `--vital-500`, the success intent         |
| Ink                 | `#0f1f3d` | the dark end of the grey ramp, hue 262    |
| Warm accent         | `#ff8a5b` | `--warning`, the badge and banner accent  |

The typeface of the wordmark is not a web font the estate loads. Text is set in Inter. The
wordmark is always the image, never typed.

## Why a logo is a PNG here

No vector file exists (Jamie, 19 November 2026). `logo/remi-logo-charte.png` is the reference:
its letters have flat colours and clean edges, and the November original has a gradient and
rougher edges. A vector or a higher-definition export of the charter logo would replace it, and
the derived files would be cut again. They were cut with Pillow: each letter is one flat colour on
white, so the alpha of a pixel is its distance from white divided by the letter's distance from
white, and the colour stays the letter's colour. The letters are not redrawn or moved.
