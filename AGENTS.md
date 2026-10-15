# Project Overview

Wayfold is a fullstack responsive web application: a micro-community (social network) for people in
Toronto and the GTA who buy, sell and look after cars. Autos only. Built for Christians: members can
show their home church as a trust signal; anyone in the GTA can join.

- Members make a profile, share the cars they own (their garage), list private sales, and recommend
  the dealers, mechanics and products they use.
- Auto industry providers of all kinds have profiles: dealers, mechanics, body shops, tire shops,
  detailers, towing, insurance brokers, parts stores and financing professionals.
- Dealers list their inventory with AutoTrader-level detail (year, make, model, price, pictures,
  description and more). Every vehicle has its own detail page, and vehicles are searchable across
  private sellers and all dealers.
- Each vehicle shows a price rating, and verified financing professionals answer members' public
  questions about whether a price or financing offer is a good deal.

## Web Framework

This repository uses Next.js (App Router) and React as the web framework.

- Meet WCAG 2.2 AA.

## Scope, Simplicity, and Zero-Waste Engineering (CRITICAL)

This is the absolute highest-priority rule in this repository. AI agents tend to over-engineer, hallucinate future needs, and balloon codebase complexity. This kills project velocity and comprehensibility. You must resist this impulse. Deliver radically simple solutions that fulfill the exact prompt—nothing more.

### 1. Absolute Scope Lock
*   **Deliver Only the Explicit Request:** Implement exactly what is asked for in the immediate task. Do not invent features, add unrequested states, create predictive API endpoints, or spin up new UI screens/components unless explicitly ordered.
*   **Zero Future-Proofing:** Do not write code for "imagined future use cases." Write code strictly for the present moment. If the user didn't ask for it today, it does not exist.
*   **Ignore Unsent Requirements:** Documents, specs, or mocks may contain broader context or future phases. Do not implement them early. Only implement what is requested in the active prompt.

### 2. Radical Simplicity & Proportionality
*   **Proportional Diffs:** The size and footprint of your code change must match the size of the request. A small feature or fix must result in a small, clean, readable diff.
*   **Path of Least Resistance:** Always choose the simplest, most direct code path that solves the problem. Do not introduce new abstractions, architectural layers, design patterns, wrappers, or external libraries unless it is physically impossible to solve the issue without them.
*   **No Unsolicited Refactoring:** Do not "improve," rewrite, or clean up code adjacent to your task unless it is strictly broken and blocking your implementation. Leave surrounding code alone.

### 3. Hard Stop & Query Clause
*   **When in Doubt, Ask:** If a task seems to logically require expanding the scope, introduces a major jump in complexity, or conflicts with the existing architecture, **STOP IMMEDIATELY**. Do not guess. Present the trade-offs to the user and await explicit confirmation before writing a single line of code.

## Incremental Implementation and ATDD - mandatory

Mocks and the design system are design artifacts. ATDD does not apply to their
development. Do not write tests for mocks or the design system.

Every new feature or change to production behavior MUST have a requirement, a
detailed design, and a mock before implementation begins. This includes
behavioral changes to existing features, such as changing how a page behaves.
This requirement applies to production-code changes only; documentation-only,
design-system-only, mock-only, and test-only changes are out of scope unless
they are part of implementing a production behavior change.

Every production behavior implementation MUST invoke and follow the
`implementing-incrementally` skill (`.claude/skills/implementing-incrementally`
and `.agents/skills/implementing-incrementally`) before any code is written,
combined with acceptance test-driven development (ATDD). Plan small,
reviewable slices, then complete one slice at a time: write Given-When-Then
acceptance criteria, write the acceptance test, and run it to prove it fails for
the expected reason BEFORE writing production code. Implement only what satisfies
that slice, refactor with tests green, and run the relevant regression checks.
Do not move to the next slice until those checks pass. No bulk implementation,
no tests added afterward, and no weakening tests to manufacture a pass. Keep
the requirement, detailed design, mock, criteria, tests, and implementation
aligned until the entire feature or behavior change is complete.

Front end tests use Playwright with the Page Object Model - one page object per
screen, owning the selectors and the interactions. Tests state intent; page
objects know the DOM. Never put a selector in a test.

Frontend tests never need the backend running: fake every API response with
Playwright route interception. 

Run frontend tests in Chromium only. Do not configure or run Firefox, WebKit,
or any other browser for frontend testing.

### Never write architecture tests

Never add a test that asserts the shape of the codebase rather than its behavior:
no structure, layout, or naming tests; no banned-API scans; no traceability tests
that parse the specifications. Those constraints belong to the compiler, the
formatter, and review. A test suite exists to prove behavior.

## Skills

Project skills live in `.claude/skills/` and are mirrored in `.agents/skills/`
for other agents. Keep the two copies identical.

- `engineering-requirements` — L1/L2 requirements with acceptance criteria
- `writing-software-design-documents` — detailed designs from requirements
- `writing-html-mocks` — static HTML mocks for every page, dialog and
  notification in every state
- `extracting-design-systems` — design system from the HTML mocks
- `writing-component-requirements-documents` — CRDs for UI components
- `writing-screen-composition` — screen-to-component map and the library mandate
- `implementing-incrementally` — thin, verifiable slices (mandatory, see above)
- `creating-videos` — narrated walkthrough videos

## Expected Folder Structure

The product is a single Next.js (App Router) app at the repository root. Routes mirror
`docs/mocks/manifest.json`. Put code where it is listed here; do not add new top-level
folders without asking.

```
wayfold/
├── AGENTS.md, CLAUDE.md, GEMINI.md
├── .claude/skills/, .agents/skills/   # mirrored skills, kept identical
├── docs/
│   ├── specs/                         # L1.md, L2.md requirements
│   ├── detailed-designs/              # per-feature designs
│   ├── mocks/                         # static HTML mocks (design artifact)
│   ├── design-system/                 # tokens and component pages
│   ├── plans/                         # business-plan.md
│   └── videos/                        # narrated videos
├── tools/                             # video and diagram tooling
├── public/                            # static assets
├── src/
│   ├── app/                           # routes; each folder holds page.tsx
│   │   ├── layout.tsx, page.tsx       # shell and home (/)
│   │   ├── not-found.tsx, error.tsx   # 404 and 500 pages
│   │   ├── sign-in/, sign-up/, settings/
│   │   ├── members/[id]/
│   │   ├── providers/                 # list, [id]/, new/
│   │   ├── vehicles/                  # list, [id]/, new/
│   │   ├── products/
│   │   ├── inventory/                 # dealer inventory
│   │   └── api/                       # route handlers
│   ├── components/                    # shared UI, one folder per component
│   ├── features/                      # per L1 feature: dialogs, forms, hooks, server logic
│   └── lib/                           # shared helpers, API client, validation
└── tests/
    ├── e2e/                           # Playwright specs, intent only
    └── pages/                         # one page object per screen, owns selectors
```

Dialogs and notifications live with the feature that opens them, not under `app/`.
Tests fake every API response with Playwright route interception and run in Chromium only.
