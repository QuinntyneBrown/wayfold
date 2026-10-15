# 05 · Providers and recommendations

> **Runtime:** ~2:32 · **Audience:** car owners looking for a provider, and anyone reviewing providers, recommendations and products · **Prerequisites:** none; [video 01](../01-the-plan-in-plain-words/README.md) gives the background

**Video:** [05-providers-and-recommendations.mp4](05-providers-and-recommendations.mp4) · [Slides](slides.html) · **Audio:** [05-providers-and-recommendations.mp3](05-providers-and-recommendations.mp3) · [Transcript](script.md)

## Why this video exists

Shows the provider directory ranked by member recommendations, how to recommend a business, and how product recommendations work without any selling. Requirements covered: L1-012, L1-011, L1-002 (`docs/specs/L1.md`). Every screen is a static mock from `docs/mocks/`, not the running app.

## Learning objectives

By the end, the viewer can:

- Filter the provider directory and read its ranking.
- Write a recommendation and say where it appears.
- Recommend a product and explain why Wayfold does not sell it.

## Key questions

| Question | What a strong answer includes |
|---|---|
| How are providers ranked? | By member recommendations (L2-031) |
| How long is a recommendation? | 10 to 500 characters (L2-026) |
| Does Wayfold sell products? | No; members say where they bought them (L2-027, L2-029) |

## Code / assets on screen

| File | Source mock (light theme) |
|---|---|
| `img/providers.png` | `docs/mocks/pages/providers/default.html` |
| `img/providers-none.png` | `docs/mocks/pages/providers/no-results.html` |
| `img/provider.png` | `docs/mocks/pages/provider/default.html` |
| `img/recommend.png` | `docs/mocks/dialogs/recommend/default.html` |
| `img/recommend-invalid.png` | `docs/mocks/dialogs/recommend/invalid.html` |
| `img/recommend-success.png` | `docs/mocks/dialogs/recommend/success.html` |
| `img/member-recs.png` | `docs/mocks/pages/member/recommendations.html` |
| `img/feed.png` | `docs/mocks/pages/home/feed.html` |
| `img/products.png` | `docs/mocks/pages/products/default.html` |
| `img/recommend-product.png` | `docs/mocks/dialogs/recommend/product.html` |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:20 | Introduction | Who you can see, not who you know |
| 00:20-00:54 | Directory | Every kind of auto business; Ranked by recommendations; No matches |
| 00:54-01:16 | Provider page | Danforth Auto Care |
| 01:16-01:42 | Recommend | 10 to 500 characters; Check, then posted; Where it shows up |
| 01:42-02:09 | Products | Recommended, not sold; Name, category, where, why |
| 02:09-02:32 | Recap | Recap; Next: dealers and financing pros |

## Demo commands

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/05-providers-and-recommendations/deck.py docs/videos/05-providers-and-recommendations
node tools/video-audio/generate-audio.mjs docs/videos/05-providers-and-recommendations --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/05-providers-and-recommendations --engine piper
node tools/video-build/build-video.mjs docs/videos/05-providers-and-recommendations --check
node tools/video-build/build-video.mjs docs/videos/05-providers-and-recommendations
```

`slides.html` is generated from `deck.py`; edit the spec and regenerate rather than editing the HTML.

## Pitfalls

- The screens are mocks dated Thursday 15 October 2026. Names, prices and counts are the mocks' cast and sample data, not real members or listings.
- When a mock changes, re-run the screenshots and `feature-deck.py`, then rebuild; the images in `img/` are committed copies.
- The narration was synthesized offline with Kokoro because the Edge read-aloud service returned HTTP 403; see [the videos README](../README.md).

## References

- `docs/specs/L1.md`, `docs/specs/L2.md`
- `docs/mocks/README.md` and `docs/mocks/walkthrough.md`
