# Wayfold videos

Narrated slide videos made with the `creating-videos` skill (`.claude/skills/creating-videos`).
Each folder holds the transcript (`script.md`), the timed deck (`slides.html`), an
outline (`README.md`), the narration (MP3) and the 1080p video with burned-in captions (MP4).

| # | Video | Runtime | What it covers |
|---|---|---|---|
| 01 | [The plan, in plain words](01-the-plan-in-plain-words/README.md) | 7:04 | The business plan: who pays, three years of revenue and profit, cash, growth, risk |
| 02 | [Join and set up your profile](02-join-and-set-up-your-profile/README.md) | 2:47 | Sign up, sign in, settings and the optional home church, phone menu, error pages |
| 03 | [Your garage and selling your car](03-your-garage-and-selling-your-car/README.md) | 2:29 | Add a car, share it, list it for sale, what buyers see |
| 04 | [Finding a vehicle and the deal question](04-finding-a-vehicle-and-the-deal-question/README.md) | 2:35 | Vehicle search, price rating, public deal questions, message the seller |
| 05 | [Providers and recommendations](05-providers-and-recommendations/README.md) | 2:32 | Provider directory, recommending a business, product recommendations |
| 06 | [Dealers and financing professionals](06-dealers-and-financing-professionals/README.md) | 2:30 | List your business, dealer inventory, verified financing professionals |

Video 01 reads every figure from [`docs/plans/business-plan.md`](../plans/business-plan.md).
Videos 02 to 06 show screenshots of the HTML mocks in [`docs/mocks/`](../mocks/README.md).

## Making or updating a video

One-time setup, from the repo root:

```sh
cd tools && npm install && cd ..        # Playwright for the slide renderer
python -m pip install edge-tts           # default narration engine
```

Then, per video:

```sh
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic
node tools/video-build/build-video.mjs docs/videos/NN-topic --check
node tools/video-build/build-video.mjs docs/videos/NN-topic --slides-only   # review .cache/videos/NN-topic/slides
node tools/video-build/build-video.mjs docs/videos/NN-topic
```

Intermediate files go to `.cache/videos/` (git-ignored).

## Offline voice

As of October 2026 the Edge read-aloud service returns HTTP 403 from the build
machine, so every narration here was synthesized offline with the Kokoro
`af_heart` voice through the generator's `piper` engine slot. The stand-in
`piper` module is `tools/video-audio/kokoro-shim/piper/__main__.py`.

```sh
python -m pip install kokoro-onnx soundfile   # plus kokoro-v1.0.onnx and voices-v1.0.bin in KOKORO_DIR
PYTHONPATH=tools/video-audio/kokoro-shim KOKORO_DIR=path/to/model PIPER_MODEL=af_heart \
  node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --engine piper
```

Switch back to the default Edge voice once the service answers; clips are cached per engine and voice, so it re-synthesizes everything.

## Walkthrough decks and screenshots

Videos 02 to 06 generate `slides.html` from a small spec, `deck.py`, with
`tools/video-build/feature-deck.py`. The spec lists the mock screenshots to copy
into the folder's `img/` (optionally cropped) and the slides with their cues.
Screenshots are taken with the mocks skill's script at the slide frame size, so
they fill the 1408x792 frame without scaling:

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/NN-topic/deck.py docs/videos/NN-topic
```

A slide shows a static screenshot with `<img class="clip">` (or `clip phone`)
followed by an `<aside class="clip-notes">`; `slides.css` gives it the same
layout as a screen recording.
