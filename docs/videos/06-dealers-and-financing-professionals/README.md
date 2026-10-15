# 06 · Dealers and financing professionals

> **Runtime:** ~2:30 · **Audience:** dealers, providers and financing professionals, and anyone reviewing business profiles and inventory · **Prerequisites:** none; [video 01](../01-the-plan-in-plain-words/README.md) gives the background

**Video:** [06-dealers-and-financing-professionals.mp4](06-dealers-and-financing-professionals.mp4) · [Slides](slides.html) · **Audio:** [06-dealers-and-financing-professionals.mp3](06-dealers-and-financing-professionals.mp3) · [Transcript](script.md)

## Why this video exists

Shows how any auto business lists itself for free, how a dealer manages inventory, and how financing professionals become verified. Requirements covered: L1-012, L1-003, L1-013 (`docs/specs/L1.md`). Every screen is a static mock from `docs/mocks/`, not the running app.

## Learning objectives

By the end, the viewer can:

- List a business and add a financing credential.
- Add, publish and delete dealer inventory.
- Explain what the Verified tag means.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who can list a business? | Every kind of auto provider, free (L2-032) |
| How does a dealer list cars? | Add vehicle in the inventory; each gets a page and price rating (L2-034) |
| What does Verified mean? | Wayfold checked the licence, e.g. FSRA (L2-033) |

## Code / assets on screen

| File | Source mock (light theme) |
|---|---|
| `img/editor.png` | `docs/mocks/pages/provider-editor/default.html` |
| `img/editor-licence.png` | `docs/mocks/pages/provider-editor/default.html`, cropped from y=300 |
| `img/editor-invalid.png` | `docs/mocks/pages/provider-editor/invalid.html` |
| `img/editor-success.png` | `docs/mocks/pages/provider-editor/success.html` |
| `img/dealer.png` | `docs/mocks/pages/provider/dealer.html` |
| `img/inventory-empty.png` | `docs/mocks/pages/dealer-inventory/empty.html` |
| `img/add-vehicle.png` | `docs/mocks/pages/vehicle-editor/dealer.html` |
| `img/listed.png` | `docs/mocks/notifications/inventory-toast/success.html` |
| `img/delete.png` | `docs/mocks/dialogs/delete-vehicle/default.html` |
| `img/delete-failed.png` | `docs/mocks/dialogs/delete-vehicle/failed.html` |
| `img/financing.png` | `docs/mocks/pages/provider/financing.html` |
| `img/answer.png` | `docs/mocks/pages/vehicle-detail/default.html`, cropped from y=860 |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:20 | Introduction | Free for businesses too |
| 00:20-00:53 | List your business | One profile, every kind; Add your licence; Check, then submitted |
| 00:53-01:07 | Dealer profile | Eglinton Auto Group |
| 01:07-01:43 | Inventory | Starts empty; Add dealer inventory; Vehicle listed; Delete, with a check |
| 01:43-02:07 | Financing pros | Marcus Chen; On the vehicle page |
| 02:07-02:30 | Recap | Recap; That is Wayfold |

## Demo commands

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/06-dealers-and-financing-professionals/deck.py docs/videos/06-dealers-and-financing-professionals
node tools/video-audio/generate-audio.mjs docs/videos/06-dealers-and-financing-professionals --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/06-dealers-and-financing-professionals --engine piper
node tools/video-build/build-video.mjs docs/videos/06-dealers-and-financing-professionals --check
node tools/video-build/build-video.mjs docs/videos/06-dealers-and-financing-professionals
```

`slides.html` is generated from `deck.py`; edit the spec and regenerate rather than editing the HTML.

## Pitfalls

- The screens are mocks dated Thursday 15 October 2026. Names, prices and counts are the mocks' cast and sample data, not real members or listings.
- When a mock changes, re-run the screenshots and `feature-deck.py`, then rebuild; the images in `img/` are committed copies.
- The narration was synthesized offline with Kokoro because the Edge read-aloud service returned HTTP 403; see [the videos README](../README.md).

## References

- `docs/specs/L1.md`, `docs/specs/L2.md`
- `docs/mocks/README.md` and `docs/mocks/walkthrough.md`
