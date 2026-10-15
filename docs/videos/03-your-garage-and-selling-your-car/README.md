# 03 · Your garage and selling your car

> **Runtime:** ~2:29 · **Audience:** members who own and sell cars, and anyone reviewing the garage and listing flows · **Prerequisites:** none; [video 01](../01-the-plan-in-plain-words/README.md) gives the background

**Video:** [03-your-garage-and-selling-your-car.mp4](03-your-garage-and-selling-your-car.mp4) · [Slides](slides.html) · **Audio:** [03-your-garage-and-selling-your-car.mp3](03-your-garage-and-selling-your-car.mp3) · [Transcript](script.md)

## Why this video exists

Shows how a car moves from the garage to a private listing, using Tendai’s Bluebird and Priya’s RAV4 from the mocks. Requirements covered: L1-010, L1-004, L1-003 (`docs/specs/L1.md`). Every screen is a static mock from `docs/mocks/`, not the running app.

## Learning objectives

By the end, the viewer can:

- Add a car to the garage and recover from errors.
- Start a private listing from a garage car.
- Read a private listing: price rating, seller, church tag, message seller.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What does a car need? | Year, make and model; nickname, photo and notes are optional (L2-024) |
| How does selling start? | Sell this car pre-fills the listing from the garage (L2-025) |
| What does a buyer see? | Price rating against similar GTA listings and a message seller button (L2-036, L2-009) |

## Code / assets on screen

| File | Source mock (light theme) |
|---|---|
| `img/garage.png` | `docs/mocks/pages/member/own.html` |
| `img/add-car.png` | `docs/mocks/dialogs/add-car/default.html` |
| `img/add-car-invalid.png` | `docs/mocks/dialogs/add-car/invalid.html` |
| `img/add-car-failed.png` | `docs/mocks/dialogs/add-car/failed.html` |
| `img/feed-toast.png` | `docs/mocks/notifications/community-toast/success.html` |
| `img/sell.png` | `docs/mocks/pages/vehicle-editor/default.html` |
| `img/sell-invalid.png` | `docs/mocks/pages/vehicle-editor/invalid.html` |
| `img/sell-success.png` | `docs/mocks/pages/vehicle-editor/success.html` |
| `img/private.png` | `docs/mocks/pages/vehicle-detail/private.html` |
| `img/sold.png` | `docs/mocks/pages/vehicle-detail/sold.html` |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:16 | Introduction | From garage to sale |
| 00:16-00:30 | Your garage | Tendai’s garage |
| 00:30-00:51 | Add a car | Year, make, model; Mistakes and dropped connections |
| 00:51-01:03 | Share it | Share with your community |
| 01:03-01:32 | Sell this car | Starts from Bluebird; Check, then publish |
| 01:32-02:02 | What buyers see | 2019 Toyota RAV4 XLE; Fair price; The page stays up |
| 02:02-02:29 | Recap | Recap; Next: finding a vehicle |

## Demo commands

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/03-your-garage-and-selling-your-car/deck.py docs/videos/03-your-garage-and-selling-your-car
node tools/video-audio/generate-audio.mjs docs/videos/03-your-garage-and-selling-your-car --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/03-your-garage-and-selling-your-car --engine piper
node tools/video-build/build-video.mjs docs/videos/03-your-garage-and-selling-your-car --check
node tools/video-build/build-video.mjs docs/videos/03-your-garage-and-selling-your-car
```

`slides.html` is generated from `deck.py`; edit the spec and regenerate rather than editing the HTML.

## Pitfalls

- The screens are mocks dated Thursday 15 October 2026. Names, prices and counts are the mocks' cast and sample data, not real members or listings.
- When a mock changes, re-run the screenshots and `feature-deck.py`, then rebuild; the images in `img/` are committed copies.
- The narration was synthesized offline with Kokoro because the Edge read-aloud service returned HTTP 403; see [the videos README](../README.md).

## References

- `docs/specs/L1.md`, `docs/specs/L2.md`
- `docs/mocks/README.md` and `docs/mocks/walkthrough.md`
