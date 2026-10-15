# 04 · Finding a vehicle and the deal question

> **Runtime:** ~2:35 · **Audience:** car buyers, and anyone reviewing search, vehicle detail and deal guidance · **Prerequisites:** none; [video 01](../01-the-plan-in-plain-words/README.md) gives the background

**Video:** [04-finding-a-vehicle-and-the-deal-question.mp4](04-finding-a-vehicle-and-the-deal-question.mp4) · [Slides](slides.html) · **Audio:** [04-finding-a-vehicle-and-the-deal-question.mp3](04-finding-a-vehicle-and-the-deal-question.mp3) · [Transcript](script.md)

## Why this video exists

Shows one search across private sellers and dealers, the price rating, and the public deal question answered by a verified financing professional. Requirements covered: L1-003, L1-005, L1-013 (`docs/specs/L1.md`). Every screen is a static mock from `docs/mocks/`, not the running app.

## Learning objectives

By the end, the viewer can:

- Search and filter vehicles across every GTA seller.
- Read a price rating, and the honest no-rating state.
- Ask a public deal question and message a seller.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Does search include dealers? | Yes, private sellers and every dealer in one search (L2-008) |
| What if there is not enough data? | The page says so instead of rating (`vehicle-detail/no-rating`) |
| Who answers deal questions? | Verified financing professionals, in public (L2-037, L2-038) |

## Code / assets on screen

| File | Source mock (light theme) |
|---|---|
| `img/vehicles.png` | `docs/mocks/pages/vehicles/default.html` |
| `img/no-results.png` | `docs/mocks/pages/vehicles/no-results.html` |
| `img/detail.png` | `docs/mocks/pages/vehicle-detail/default.html` |
| `img/no-rating.png` | `docs/mocks/pages/vehicle-detail/no-rating.html` |
| `img/answer.png` | `docs/mocks/pages/vehicle-detail/default.html`, cropped from y=860 |
| `img/ask.png` | `docs/mocks/dialogs/ask-expert/default.html` |
| `img/ask-invalid.png` | `docs/mocks/dialogs/ask-expert/invalid.html` |
| `img/ask-success.png` | `docs/mocks/dialogs/ask-expert/success.html` |
| `img/no-questions.png` | `docs/mocks/pages/vehicle-detail/no-questions.html`, cropped from y=860 |
| `img/contact.png` | `docs/mocks/dialogs/contact-dealer/default.html` |
| `img/contact-success.png` | `docs/mocks/dialogs/contact-dealer/success.html` |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:14 | Introduction | Is this a good deal? |
| 00:14-00:48 | Search | One search, every seller; A rating on every card; No matches |
| 00:48-01:19 | The vehicle page | 2021 Honda Civic Sport; Not enough to compare |
| 01:19-02:01 | Ask about this deal | Is 6.99% over 84 months a good offer?; Pick a topic, ask in public; Nudge, then posted; Be the first to ask |
| 02:01-02:12 | Message the seller | Message the seller |
| 02:12-02:35 | Recap | Recap; Next: providers you can trust |

## Demo commands

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/04-finding-a-vehicle-and-the-deal-question/deck.py docs/videos/04-finding-a-vehicle-and-the-deal-question
node tools/video-audio/generate-audio.mjs docs/videos/04-finding-a-vehicle-and-the-deal-question --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/04-finding-a-vehicle-and-the-deal-question --engine piper
node tools/video-build/build-video.mjs docs/videos/04-finding-a-vehicle-and-the-deal-question --check
node tools/video-build/build-video.mjs docs/videos/04-finding-a-vehicle-and-the-deal-question
```

`slides.html` is generated from `deck.py`; edit the spec and regenerate rather than editing the HTML.

## Pitfalls

- The screens are mocks dated Thursday 15 October 2026. Names, prices and counts are the mocks' cast and sample data, not real members or listings.
- When a mock changes, re-run the screenshots and `feature-deck.py`, then rebuild; the images in `img/` are committed copies.
- The narration was synthesized offline with Kokoro because the Edge read-aloud service returned HTTP 403; see [the videos README](../README.md).

## References

- `docs/specs/L1.md`, `docs/specs/L2.md`
- `docs/mocks/README.md` and `docs/mocks/walkthrough.md`
