# Wayfold mocks

Static HTML mocks for the autos-only GTA community. Open [index.html](index.html) from disk to browse 24 screens and 113 states. Each HTML file carries `mock:requirements` IDs from `docs/specs/L2.md`. The mocks use the shared design system in `docs/design-system/` and mock-local, token-only additions in `assets/ui.css`.

**Covered:** public front door; signed-in auto feed; account and home-church settings; member garage, private sales, recommendations and posts; vehicles from private sellers and dealers; provider directory and a unified provider profile for mechanics, dealers and financing professionals; recommended products; business and vehicle editors; dialogs, menus, notifications, and 404/500 pages.

## Cast and catalog

Today is Thursday 15 October 2026. Tendai Mensah is the signed-in member; his garage holds a 2015 Honda Fit named Bluebird. Priya Nair, of Etobicoke, attends Lakeshore Fellowship and sells a 2019 Toyota RAV4 XLE. Samuel Adeyemi, of Brampton, attends Grace Community Church and sells a 2017 Subaru Outback. Danforth Auto Care is a Toronto mechanic whose owner attends St. Paul's Anglican. Eglinton Auto Group sells the Civic and Mazda3; Lakeshore Motors has the Tucson; Brampton Pre-Owned has the F-150. Marcus Chen is a verified financing professional.

Products: Michelin X-Ice Snow winter tires, WeatherTech floor liners, Viofo A129 dash cam and Chemical Guys detailing kit. Members recommend products and mention where they bought them; Wayfold does not sell them.

## Viewing and checking

- `?theme=dark` forces dark mode; `?chrome=0` hides the mock bar.
- Regenerate from the plan's scratch generator: `python C:\Users\quinn\.gemini\antigravity-cli\brain\d90c6363-d258-4401-9c67-d8a3ed257c18\scratch\gen_all.py`
- Validate and refresh this coverage matrix: `python .agents/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks --write`
- Screenshot at 360, 768 and 1280 px in light and dark: `python .agents/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks`

## Open questions and assumptions

- Home church is optional free text, at most 80 characters. The member chooses whether signed-in members can see it. Signed-out visitors never receive it.
- A provider's church is the owner's church, shown only when the owner opts in and the viewer is signed in.
- Visitors can browse vehicles, providers and products. The feed and member profiles require sign-in.
- A member has one recommendation per provider or product; a second submission edits the first.
- Verification of financing professionals is required by the specifications. An admin verification screen and off-topic moderation tools are outside this mock pass.
- Vehicle pictures are neutral SVG illustrations for the mocks.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | locked | invalid | submitting | success | duplicate | feed | for-sale | recommendations | posts | own | no-results | dealer | financing | private | sold | no-rating | no-questions | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | [✅](pages/sign-in/loading.html) | ➖ | [✅](pages/sign-in/error.html) | [✅](pages/sign-in/locked.html) | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-002`, `L2-016`, `L2-017` |
| Create account (`sign-up`) | [✅](pages/sign-up/default.html) | [✅](pages/sign-up/loading.html) | ➖ | [✅](pages/sign-up/error.html) |  | [✅](pages/sign-up/invalid.html) | [✅](pages/sign-up/submitting.html) | [✅](pages/sign-up/success.html) | [✅](pages/sign-up/duplicate.html) |  |  |  |  |  |  |  |  |  |  |  |  | `L2-001` |
| Home (`home`) | [✅](pages/home/default.html) | [✅](pages/home/loading.html) | [✅](pages/home/empty.html) | [✅](pages/home/error.html) |  |  |  |  |  | [✅](pages/home/feed.html) |  |  |  |  |  |  |  |  |  |  |  | `L2-039`, `L2-011`, `L2-012`, `L2-013`, `L2-028` |
| Account settings (`settings`) | [✅](pages/settings/default.html) | [✅](pages/settings/loading.html) | ➖ | [✅](pages/settings/error.html) |  | [✅](pages/settings/invalid.html) | [✅](pages/settings/submitting.html) | [✅](pages/settings/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-003`, `L2-022` |
| Member profile (`member`) | [✅](pages/member/default.html) | [✅](pages/member/loading.html) | [✅](pages/member/empty.html) | [✅](pages/member/error.html) |  |  |  |  |  |  | [✅](pages/member/for-sale.html) | [✅](pages/member/recommendations.html) | [✅](pages/member/posts.html) | [✅](pages/member/own.html) |  |  |  |  |  |  |  | `L2-010`, `L2-011`, `L2-022`, `L2-023`, `L2-024`, `L2-025`, `L2-028` |
| Providers (`providers`) | [✅](pages/providers/default.html) | [✅](pages/providers/loading.html) | [✅](pages/providers/empty.html) | [✅](pages/providers/error.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/providers/no-results.html) |  |  |  |  |  |  | `L2-031`, `L2-014` |
| Provider profile (`provider`) | [✅](pages/provider/default.html) | [✅](pages/provider/loading.html) | ➖ | [✅](pages/provider/error.html) |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/provider/dealer.html) | [✅](pages/provider/financing.html) |  |  |  |  | `L2-030`, `L2-028`, `L2-023`, `L2-033`, `L2-034`, `L2-038` |
| Products (`products`) | [✅](pages/products/default.html) | [✅](pages/products/loading.html) | [✅](pages/products/empty.html) | [✅](pages/products/error.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/products/no-results.html) |  |  |  |  |  |  | `L2-029`, `L2-027` |
| List your business (`provider-editor`) | [✅](pages/provider-editor/default.html) | [✅](pages/provider-editor/loading.html) | ➖ | [✅](pages/provider-editor/error.html) |  | [✅](pages/provider-editor/invalid.html) | [✅](pages/provider-editor/submitting.html) | [✅](pages/provider-editor/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-032`, `L2-033` |
| Vehicles (`vehicles`) | [✅](pages/vehicles/default.html) | [✅](pages/vehicles/loading.html) | [✅](pages/vehicles/empty.html) | [✅](pages/vehicles/error.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/vehicles/no-results.html) |  |  |  |  |  |  | `L2-008`, `L2-014`, `L2-036` |
| Vehicle detail (`vehicle-detail`) | [✅](pages/vehicle-detail/default.html) | [✅](pages/vehicle-detail/loading.html) | ➖ | [✅](pages/vehicle-detail/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/vehicle-detail/private.html) | [✅](pages/vehicle-detail/sold.html) | [✅](pages/vehicle-detail/no-rating.html) | [✅](pages/vehicle-detail/no-questions.html) | `L2-035`, `L2-036`, `L2-037`, `L2-038`, `L2-009`, `L2-023` |
| Sell your car (`vehicle-editor`) | [✅](pages/vehicle-editor/default.html) | [✅](pages/vehicle-editor/loading.html) | ➖ | [✅](pages/vehicle-editor/error.html) |  | [✅](pages/vehicle-editor/invalid.html) | [✅](pages/vehicle-editor/submitting.html) | [✅](pages/vehicle-editor/success.html) |  |  |  |  |  |  |  | [✅](pages/vehicle-editor/dealer.html) |  |  |  |  |  | `L2-006`, `L2-025`, `L2-034` |
| Dealer inventory (`dealer-inventory`) | [✅](pages/dealer-inventory/default.html) | [✅](pages/dealer-inventory/loading.html) | [✅](pages/dealer-inventory/empty.html) | [✅](pages/dealer-inventory/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-034`, `L2-007` |
| Page not found (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-021` |
| Something went wrong (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-021` |

### Dialogs

| Screen | default | busy | invalid | failed | product | success | signed-in | Requirements |
|---|---|---|---|---|---|---|---|---|
| Add a car (`add-car`) | [✅](dialogs/add-car/default.html) | [✅](dialogs/add-car/busy.html) | [✅](dialogs/add-car/invalid.html) | [✅](dialogs/add-car/failed.html) |  |  |  | `L2-024` |
| Recommend (`recommend`) | [✅](dialogs/recommend/default.html) | [✅](dialogs/recommend/busy.html) | [✅](dialogs/recommend/invalid.html) | [✅](dialogs/recommend/failed.html) | [✅](dialogs/recommend/product.html) | [✅](dialogs/recommend/success.html) |  | `L2-026`, `L2-027` |
| Contact seller (`contact-dealer`) | [✅](dialogs/contact-dealer/default.html) | [✅](dialogs/contact-dealer/busy.html) | [✅](dialogs/contact-dealer/invalid.html) | [✅](dialogs/contact-dealer/failed.html) |  | [✅](dialogs/contact-dealer/success.html) |  | `L2-009` |
| Delete vehicle (`delete-vehicle`) | [✅](dialogs/delete-vehicle/default.html) | [✅](dialogs/delete-vehicle/busy.html) | ➖ | [✅](dialogs/delete-vehicle/failed.html) |  |  |  | `L2-007` |
| Ask about this deal (`ask-expert`) | [✅](dialogs/ask-expert/default.html) | [✅](dialogs/ask-expert/busy.html) | [✅](dialogs/ask-expert/invalid.html) | [✅](dialogs/ask-expert/failed.html) |  | [✅](dialogs/ask-expert/success.html) |  | `L2-037` |
| Site menu (`site-menu`) | [✅](dialogs/site-menu/default.html) | ➖ | ➖ |  |  |  | [✅](dialogs/site-menu/signed-in.html) | `L2-015` |
| Account menu (`account-menu`) | [✅](dialogs/account-menu/default.html) | ➖ | ➖ |  |  |  |  | `L2-015` |

### Notifications

| Screen | info | success | warning | danger | stacked | Requirements |
|---|---|---|---|---|---|---|
| Inventory toasts (`inventory-toast`) | [✅](notifications/inventory-toast/info.html) | [✅](notifications/inventory-toast/success.html) | [✅](notifications/inventory-toast/warning.html) | [✅](notifications/inventory-toast/danger.html) | [✅](notifications/inventory-toast/stacked.html) | `L2-034` |
| Community toasts (`community-toast`) | [✅](notifications/community-toast/info.html) | [✅](notifications/community-toast/success.html) | [✅](notifications/community-toast/warning.html) | [✅](notifications/community-toast/danger.html) | [✅](notifications/community-toast/stacked.html) | `L2-012`, `L2-026` |

<!-- coverage:end -->
