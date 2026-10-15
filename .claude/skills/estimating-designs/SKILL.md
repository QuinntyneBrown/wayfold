---
name: estimating-designs
description: Create or refresh docs/estimates/, one brief document per subsystem with a table giving each detailed design's effort estimate and percentage of implementation complete. Use when the user asks for estimates, effort, sizing, how long features will take, progress, percent complete, or how far along the implementation is.
---

# Estimating designs

Produce `docs/estimates/{subsystem}.md` for every subsystem folder in
`docs/detailed-designs/`. Each design is `docs/detailed-designs/{subsystem}/{feature}/README.md`.

## Output format

Keep every document extremely brief: a title and a table, nothing else.

```markdown
# Estimates: {subsystem}

| Design | Effort | Complete |
|---|---|---|
| {feature} | {n} days | {p}% |
```

One row per feature folder, sorted alphabetically. No prose, notes or totals.

## Estimating effort

Estimate developer-days for an intermediate developer who knows Next.js (App
Router), React, TypeScript, Drizzle/Postgres and Playwright, working under the
AGENTS.md process (ATDD, page objects, mocked APIs, WCAG 2.2 AA).

1. Read the design README: count its behaviour (sequence) diagrams, requirements,
   components, API routes and data tables.
2. Start from about 1 day per behaviour plus 1 day of setup, then adjust:
   - add time for new tables, file uploads, search/filtering, external
     integrations or tricky accessibility (dialogs, menus);
   - subtract time when the design reuses existing code.
3. Round to whole days, typically between 2 and 7.

## Calculating percent complete

Base this on evidence, never guesses.

1. List the design's behaviours (`### Behaviour - ...` headings) and requirements.
2. For each behaviour, check `git log --oneline`, `src/app/`, `src/app/api/`,
   `src/features/` and `tests/e2e/` for its implementation and passing
   acceptance test. A behaviour counts as done only when both exist.
3. Complete = done behaviours ÷ total behaviours, weighted roughly by effort,
   rounded to the nearest 10%. 0% when nothing exists, 100% only when every
   behaviour and requirement is implemented and tested.

## Refreshing

Overwrite the existing files, keep effort estimates stable unless the design
changed, and recalculate every percentage from the current code. Add or remove
rows when designs are added or removed.
