# 01 · The plan, in plain words

> **Runtime:** ~7:04 · **Audience:** family, friends, church partners, possible backers and anyone who asks how a free site makes money · **Prerequisites:** none

**Video:** [01-the-plan-in-plain-words.mp4](01-the-plan-in-plain-words.mp4) · [Slides](slides.html) · **Audio:** [01-the-plan-in-plain-words.mp3](01-the-plan-in-plain-words.mp3) · [Transcript](script.md)

## Why this video exists

The business plan in [`docs/plans/business-plan.md`](../../plans/business-plan.md)
is written for someone who reads forecasts. This video explains it in plain
words: one picture per idea, few words on screen, and the three-year numbers
drawn as simple charts.

## Learning objectives

By the end, the viewer can:

- Say what Wayfold is and why nobody on it pays.
- Name the four money pipes and what triggers each payment.
- Give the three-year path: revenue, losses, then profit, and why members drive all of it.
- Say how much starting money is needed, when the low point comes and when it is paid back.
- Name the biggest risk and why the plan survives it.

## Key questions

| Question | What a strong answer includes |
|---|---|
| How does a free site make money? | Outside companies pay: lender referrals, insurance and warranty referrals, labelled ads, product commissions (plan, "Who pays") |
| What are the three-year numbers? | Revenue about $42K, $193K, $476K; net about −$96K, −$17K, +$174K (plan, "Profit and loss") |
| How much money is needed up front? | $225K; low point about −$130K in July 2028; first profitable month August 2028; paid back October 2029 (plan, "Cash and break-even", "Funding") |
| Where do members come from? | Church partners 15, 40, 70; free listings bring dealers; search from 2028 (plan, "Go-to-market") |
| What is the biggest risk? | Slow member growth; at 70% of plan the low point is about −$200K and 2029 profit about $32K, still inside $225K (plan, "Risks") |

## Code / assets on screen

| File | What to show |
|---|---|
| `docs/plans/business-plan.md` | Every figure on screen and in the narration |
| `img/home.png` | Home, signed out (`docs/mocks/pages/home/default.html`) |
| `img/feed.png` | Signed-in feed with church tags (`pages/home/feed.html`) |
| `img/vehicle.png` | Vehicle detail with the price rating (`pages/vehicle-detail/default.html`) |
| `img/provider.png` | Danforth Auto Care provider page (`pages/provider/default.html`) |
| `img/deal-answer.png` | The public deal question and Marcus Chen's answer, cropped from the full vehicle detail page |
| `docs/videos/assets/mark.svg` | The Wayfold mark on the title and end slides |

Charts are inline SVG in `slides.html`, drawn with design-system colour roles
from the plan's tables (P&L, monthly revenue and expenses, milestones).

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:32 | Introduction | One place for GTA car people; nobody pays; so who does? |
| 00:32-01:06 | The problem | Trust, not reach; 5,400 dealer complaints, about half unresolved; 7.1M people, ~3,800 dealers, 45,000 members needed |
| 01:06-01:53 | Free for everyone | Members, vehicles with price ratings, providers, financing pros answering in public |
| 01:53-02:48 | Who pays | Four pipes with their rates; every paid link labelled |
| 02:48-03:51 | Three years | $42K, $193K, $476K by stream; losses then profit; members 6,000, 20,000, 45,000 |
| 03:51-04:28 | The cash | $225K starting money; −$130K low in July 2028; profit from August 2028; paid back October 2029 |
| 04:28-05:24 | Getting members | Church partners 15, 40, 70; the flywheel; the timeline |
| 05:24-05:59 | One founder | AI does the routine, the founder decides; the product holds still |
| 05:59-06:29 | The risk | 70% of members: −$200K low, still covered; other risks and answers |
| 06:29-07:04 | Recap | Five things to remember; next, how you join |

## Demo commands

Screens come from the mocks at the slide frame size:

```sh
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --no-full-page --out docs/mocks/.cache/video-shots
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks --viewport 1408x792 --theme light --out docs/mocks/.cache/video-full
ffmpeg -i docs/mocks/.cache/video-full/pages__vehicle-detail__default--1408x792--light.png -vf crop=1408:792:0:860 docs/videos/01-the-plan-in-plain-words/img/deal-answer.png
```

Build (see [the videos README](../README.md) for the offline voice):

```sh
node tools/video-audio/generate-audio.mjs docs/videos/01-the-plan-in-plain-words --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/01-the-plan-in-plain-words --engine piper
node tools/video-build/build-video.mjs docs/videos/01-the-plan-in-plain-words --check
node tools/video-build/build-video.mjs docs/videos/01-the-plan-in-plain-words --slides-only
node tools/video-build/build-video.mjs docs/videos/01-the-plan-in-plain-words
```

## Pitfalls

- Every number is a planning estimate, not a result. The plan says so, and so does the narration.
- The payout rates per loan, quote, warranty, page view and member are assumptions to confirm in the first partner agreements (plan, "Who pays").
- Rounded figures on screen ($42K, $193K, $476K) come from the P&L rows 42,275, 192,612 and 475,621.
- The plan lives in a Claude Doc; `docs/plans/business-plan.md` is an export. Re-export it and update this video if the doc's numbers change.
- Nothing here is a requirement. Any product change the plan implies still needs L1/L2 requirements, a detailed design and mocks (`AGENTS.md`).

## References

- `docs/plans/business-plan.md` (every figure in the video)
- Auditor General of Ontario, Follow-up on the 2021 audit of OMVIC (2023): <https://www.auditor.on.ca/en/content/annualreports/arreports/en23/1-12FU_OMVIC_en23.pdf>
- City Population, Toronto metropolitan area: <https://citypopulation.de/en/canada/agglo/ontario/535__toronto>
- Statistics Canada, Ethnocultural diversity in Canadian cities: <https://www.statcan.gc.ca/o1/en/plus/7238-ethnocultural-diversity-canadian-cities>
