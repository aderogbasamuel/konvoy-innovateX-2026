# Brand assets

Source: `KONVOY_logo.jpg` (raster). The background was removed to make the transparent PNGs below. For print or very large use, ask the designer for the vector original.

## Logo files (`public/brand/`)

| File | Size | Use |
| --- | --- | --- |
| `logo-full.png` | 1600 x 1042, transparent | Bus, wordmark and "Safe ride platform" tagline. Share images, pitch decks, big hero spots. |
| `logo-mark.png` | 1200 x 614, transparent | The bus on its own, tagline removed. Empty states, loading screens, small marks. |
| `logo-wordmark.png` | 1200 x 158, transparent | Dark KONVOY text for light backgrounds. App headers. |
| `logo-wordmark-white.png` | 1200 x 158, transparent | White KONVOY text for the dark green backgrounds. Landing nav. |

In code use the `Logo` component: `<Logo />`, `<Logo tone="light" />`, `<Logo variant="mark" />`, `<Logo variant="full" />`.

## Icons

| File | Size | Used by |
| --- | --- | --- |
| `app/favicon.ico` | 16, 32, 48 | Browser tab. Uses the front of the bus so it stays readable when tiny. |
| `app/icon.png` | 512 x 512 | Browser and desktop icon (Next.js picks it up automatically). |
| `app/apple-icon.png` | 180 x 180 | iPhone home screen (Next.js picks it up automatically). |
| `public/icons/icon-192.png` | 192 x 192 | PWA manifest. |
| `public/icons/icon-512.png` | 512 x 512 | PWA manifest. |
| `public/icons/icon-maskable-512.png` | 512 x 512 | PWA manifest, Android adaptive icon. The bus sits inside the 80% safe zone so round and squircle masks do not clip it. |
| `public/icons/apple-touch-icon.png` | 180 x 180 | Fallback copy of the Apple icon. |

## Social sharing

| File | Size |
| --- | --- |
| `app/opengraph-image.png` | 1200 x 630 |
| `app/twitter-image.png` | 1200 x 630 |

Both show the full logo on the logo's own off-white. The `.alt.txt` files next to them are the image descriptions.

## Colours sampled from the logo

| Name | Hex |
| --- | --- |
| Logo green | `#207644` |
| Logo orange | `#EC812B` |
| Light green | `#6AAA57` |
| Light orange | `#F8B96F` |
| Wordmark | `#1F362E` |
| Logo background | `#F5FAF4` |

The app UI currently uses a deep green (`#0A3B22`) with a yellow accent (`#FFC20E`). The logo's accent is orange, so you may want to swap the yellow for `#EC812B` to match.

## Not included

iOS splash screens (they need one image per phone size) and a vector SVG of the logo.
