# Template art: prompts to create the card images

Each template card on the home screen can show a picture. Until you add one, it shows a generated colour badge, so nothing is broken without them.

## How to add an image
1. Create the image with any image generator using the prompt below.
2. Save it as a **WebP** (or convert a PNG) named exactly as in the table, for example `animation.webp`.
3. Put the files in `app/public/templates/` and rebuild. Or send them to me and I will place them and rebuild.

Size: **1024 x 768 px (4:3)**, under about 150 KB each. Keep the subject centred, because cards crop a little at the edges. No text, logos or real people's faces in any image.

## One shared style (put this at the end of every prompt, so the set matches)
> Cinematic dark-studio illustration, soft rim lighting, deep graphite background, subtle teal and warm amber accents, shallow depth of field, clean composition with the subject centred, no text, no watermark, no logo.

## The prompts
| File | Template | Prompt (add the shared style after it) |
|---|---|---|
| `podcast.webp` | Podcast | Two microphones on boom arms facing each other across a small round table, warm lamp glow, headphones resting on the table |
| `audiobook.webp` | Audiobook | An open book with sound waves rising from its pages like gentle ripples, a cosy reading lamp beside it |
| `video.webp` | Video script | A camera on a tripod pointing at a lit desk with a laptop and a ring light, a small teleprompter glow |
| `training.webp` | Training | A tidy workbench with a hard hat, a tablet showing a simple diagram and a pair of safety glasses |
| `advert.webp` | Advertising | A steaming coffee cup on a pedestal with a spotlight and a burst of golden light behind it |
| `documentary.webp` | Documentary | A wide misty landscape at dawn seen through a slightly open vintage film reel frame |
| `explainer.webp` | Explainer | A friendly whiteboard with simple hand-drawn arrows and shapes, a marker mid-air |
| `animation.webp` | Animation story | A small round-eyed fox and a little boxy robot walking side by side down a glowing forest path, storybook cartoon feel |
| `bedtime.webp` | Bedtime story | A sleepy crescent moon over rooftops, a child's bed by a window, floating stars and a tiny paper boat of light |
| `microdrama.webp` | Micro-drama | A smartphone held upright in a dark room, its screen showing a tense close-up of two silhouetted faces, a single red notification glow |
| `familydrama.webp` | Family drama | A warm kitchen at night, a table set for a family meal, one empty chair, soft golden window light and a stirred pot of food |
| `horror.webp` | Audio horror | A long dark corridor with a single swinging light bulb and a faint shape at the far end, thin fog on the floor |
| `scifi.webp` | Sci-fi | A small spaceship cockpit with glowing blue panels, a window looking at a ringed planet, a coffee mug floating by |
| `comedy.webp` | Comedy sketch | A bare stage with a single stool and a spotlight, a slipped banana peel in the glow and confetti caught mid-air |
| `game.webp` | Game dialogue | A stone village gate at dusk with lanterns, a worn wooden sign and a distant castle on a hill, fantasy adventure feel |

## Making more consistent pictures
- Generate all of them in one session with the same style line, then pick the best of four for each.
- If your tool supports a style reference or seed, reuse one for the whole set.
- Keep the same lighting direction (from the upper left) across images so the grid reads as one family.
- Faces, if any, should be fictional. Do not use a real person or a real brand.
