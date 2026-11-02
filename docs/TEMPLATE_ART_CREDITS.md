# Template pictures: how they were made

The 15 pictures in `app/public/templates/` were generated on 2026-11-02 on the owner's PC with **Stable Diffusion XL 1.0 base** (`stabilityai/stable-diffusion-xl-base-1.0`, revision `462165984030d82259a11f4367a4eed129e94a7b`, fp16), under its CreativeML Open RAIL++-M licence, which allows commercial use of the output with its use restrictions.

- **Prompts:** exactly the table in [TEMPLATE_ART_PROMPTS.md](TEMPLATE_ART_PROMPTS.md), each followed by its shared style line. The negative prompt excluded text, logos, watermarks and close-up faces.
- **Settings:** 1024 x 768, 30 steps, guidance 6.5, Euler scheduler, two candidates per template (seeds `1000 + 37*k + len(name)`).
- **Choice:** every candidate was looked at; the best of two was kept for each template. A candidate with realistic faces (micro-drama) was rejected in favour of the silhouette one, because the guide forbids faces. None of the kept pictures contains text or a logo.
- **Delivery:** resized to 800 x 600 and saved as WebP (quality 80), 15 to 61 KB each (494 KB in total).

| Picture | Kept candidate |
|---|---|
| animation | 2 |
| bedtime | 1 |
| microdrama | 1 |
| familydrama | 2 |
| horror | 2 |
| scifi | 2 |
| comedy | 2 |
| game | 2 |
| podcast | 2 |
| audiobook | 2 |
| documentary | 1 |
| explainer | 2 |
| video | 1 |
| training | 2 |
| advert | 2 |

## Replacing a picture
Save a 4:3 WebP with the same file name in `app/public/templates/` and rebuild. The home screen uses the picture when the file exists and the generated card artwork otherwise.

## Honest notes
- These are AI-generated illustrations, not licensed stock or commissioned art. They are consistent in palette (teal and amber on dark) but vary in finish: a few look more photographic and a few more like cartoons.
- A model's output can occasionally contain small artefacts (odd hands, distorted objects). Each picture was checked at card size, not at full resolution.
- Greenroom does not claim copyright in them. Check the SDXL licence if you plan to redistribute the pictures separately from the app.
