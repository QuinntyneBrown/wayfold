# 02 · Join and set up your profile

> **Runtime:** ~2:47 · **Audience:** new members and anyone reviewing the sign-up, sign-in and settings flows · **Prerequisites:** none; [video 01](../01-the-plan-in-plain-words/README.md) gives the background

**Video:** [02-join-and-set-up-your-profile.mp4](02-join-and-set-up-your-profile.mp4) · [Slides](slides.html) · **Audio:** [02-join-and-set-up-your-profile.mp3](02-join-and-set-up-your-profile.mp3) · [Transcript](script.md)

## Why this video exists

Shows the account journey end to end from the mocks, including the error, busy, locked and success states, and how the home church stays optional and private to signed-in members. Requirements covered: L1-001, L1-002, L1-006, L1-008, L1-009 (`docs/specs/L1.md`). Every screen is a static mock from `docs/mocks/`, not the running app.

## Learning objectives

By the end, the viewer can:

- Create an account and recover from field errors.
- Explain the 15-minute sign-in pause after too many attempts.
- Choose whether signed-in members see their home church.
- Find the phone menu and the not-found and error pages.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who can join? | Anyone in the GTA; name, email, password (L2-001) |
| What happens after too many wrong passwords? | Sign-in pauses for 15 minutes (`pages/sign-in/locked.html`) |
| Who sees my church? | Only signed-in members, only if the box is ticked; never visitors (L2-022) |

## Code / assets on screen

| File | Source mock (light theme) |
|---|---|
| `img/home.png` | `docs/mocks/pages/home/default.html` |
| `img/sign-up.png` | `docs/mocks/pages/sign-up/default.html` |
| `img/sign-up-invalid.png` | `docs/mocks/pages/sign-up/invalid.html` |
| `img/sign-up-submitting.png` | `docs/mocks/pages/sign-up/submitting.html` |
| `img/sign-up-success.png` | `docs/mocks/pages/sign-up/success.html` |
| `img/sign-in.png` | `docs/mocks/pages/sign-in/default.html` |
| `img/sign-in-invalid.png` | `docs/mocks/pages/sign-in/invalid.html` |
| `img/sign-in-locked.png` | `docs/mocks/pages/sign-in/locked.html` |
| `img/settings.png` | `docs/mocks/pages/settings/default.html` |
| `img/settings-invalid.png` | `docs/mocks/pages/settings/invalid.html` |
| `img/settings-success.png` | `docs/mocks/pages/settings/success.html` |
| `img/member.png` | `docs/mocks/pages/member/default.html` |
| `img/menu-phone.png` | `docs/mocks/dialogs/site-menu/signed-in.html` |
| `img/not-found.png` | `docs/mocks/pages/not-found/default.html` |
| `img/server-error.png` | `docs/mocks/pages/server-error/default.html` |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:19 | Introduction | Joining Wayfold, screen by screen |
| 00:19-00:35 | The front door | Find your people |
| 00:35-01:08 | Create your account | Name, email, password; Check these fields; Working, then you are in |
| 01:08-01:22 | Sign in | Sign in; Too many attempts |
| 01:22-01:54 | Settings | Choose what members see; Your church, your choice; Check, then save |
| 01:54-02:10 | What others see | Priya Nair |
| 02:10-02:26 | On your phone | One menu button; When something goes wrong |
| 02:26-02:47 | Recap | Recap; Next: your garage |

## Demo commands

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 360x800 --theme light --no-full-page --out docs/mocks/.cache/video-phone
python tools/video-build/feature-deck.py docs/videos/02-join-and-set-up-your-profile/deck.py docs/videos/02-join-and-set-up-your-profile
node tools/video-audio/generate-audio.mjs docs/videos/02-join-and-set-up-your-profile --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/02-join-and-set-up-your-profile --engine piper
node tools/video-build/build-video.mjs docs/videos/02-join-and-set-up-your-profile --check
node tools/video-build/build-video.mjs docs/videos/02-join-and-set-up-your-profile
```

`slides.html` is generated from `deck.py`; edit the spec and regenerate rather than editing the HTML.

## Pitfalls

- The screens are mocks dated Thursday 15 October 2026. Names, prices and counts are the mocks' cast and sample data, not real members or listings.
- When a mock changes, re-run the screenshots and `feature-deck.py`, then rebuild; the images in `img/` are committed copies.
- The narration was synthesized offline with Kokoro because the Edge read-aloud service returned HTTP 403; see [the videos README](../README.md).

## References

- `docs/specs/L1.md`, `docs/specs/L2.md`
- `docs/mocks/README.md` and `docs/mocks/walkthrough.md`
