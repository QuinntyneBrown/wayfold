# Wayfold design system

Tokens, foundations, components and patterns for Wayfold, extracted from the HTML mocks in
[`docs/mocks`](../mocks/index.html) on 15 October 2026. Light and dark themes, WCAG 2.2 AA.
Open [`index.html`](index.html) to browse it.

This system replaces an earlier one copied from another product. Every page, example and
note now comes from the Wayfold mocks; components the Wayfold mocks never use were deleted
(see the changelog).

## How to use it

1. Link `tokens/tokens.css`, then `assets/components.css`.
2. Copy markup from each component page's **Code** section; class names match the mocks.
3. Use semantic tokens (`--color-*`, `--space-*`, `--radius-*` …) or component tokens
   (`--btn-*`, `--field-*`, `--alert-*`). Never a raw colour, size or duration.
4. Design tools read `tokens/tokens.json` (DTCG), generated from `tokens.css`.

## Catalog

### Foundations

| Page | Purpose |
|---|---|
| [Color](foundations/color.html) | Ink on white, one red accent that means selected, and status colour only where a member must read a state: price ratings, verification and alerts. |
| [Typography](foundations/typography.html) | One sans family, nine sizes and sixteen roles. The price is the loudest thing on a card; the facts that decide a sale are small but never faint. |
| [Spacing](foundations/spacing.html) | A 4px scale. Small gaps tie a label to its control; large gaps separate home-page sections. White space does the dividing. |
| [Layout](foundations/layout.html) | One centred container, margins that grow with the screen, and six page templates built from content-driven grids. |
| [Elevation](foundations/elevation.html) | Flat by default. Borders separate cards; shadows only lift what floats over the page. |
| [Shape](foundations/shape.html) | Pills for anything you press, soft corners for fields and cards, and vehicle photos at 4:3 so the whole car is in frame. |
| [Motion](foundations/motion.html) | Short, calm motion that shows where a dialog, sheet or toast came from, and none at all when a member asks for less. |
| [Iconography](foundations/iconography.html) | Three glyphs, a 24-unit grid and a 2px stroke. Words do most of the work. |
| [Theming](foundations/theming.html) | Light by default, dark on request or by OS preference, and both at WCAG 2.2 AA. Themes swap semantic tokens; components never know which theme they are in. |
| [Responsive](foundations/responsive.html) | Mobile first, five breakpoints from L2-015, and grids that adapt by themselves. |
| [Accessibility](foundations/accessibility.html) | WCAG 2.2 AA on every screen (L2-016): one focus ring, 44px targets, contrast in both themes, labelled fields and announced results. |
| [Content](foundations/content.html) | Plain, warm and specific, like a neighbour who knows cars. Canadian formats, verbs on buttons, ratings with their basis, and church as a choice, never a rank. |

### Actions

| Page | Purpose |
|---|---|
| [Button](components/button.html) | Buttons do something: search vehicles, publish a listing, post a question, delete a vehicle. One solid primary per screen marks the action that screen exists fo |
| [Segmented control](components/segmented-control.html) | A row of links between sections or categories of one page, with the current one marked: the member profile's Garage, For sale, Recommendations and Posts, and th |

### Forms

| Page | Purpose |
|---|---|
| [Text field](components/text-field.html) | A labelled single-line input with help and error text. It carries every form in Wayfold: signing in, settings, listing a vehicle and searching. |
| [Textarea](components/textarea.html) | A multi-line input for anything written in sentences: a listing description, a feed post, a message to a seller or a question for financing experts. |
| [Select](components/select.html) | A native select for one choice from a fixed list: seller type, make, GTA municipality, provider or product category. |
| [Checkbox and radio](components/choice.html) | A checkbox or radio with its label text in one clickable row. Its main job in Wayfold is the member's choice to show their home church. |
| [Filters](components/filters.html) | The search form above every Wayfold list: a search box, a few selects and a Search button that reflow from one row on a desktop to one column on a phone. |

### Navigation

| Page | Purpose |
|---|---|
| [Skip link](components/skip-link.html) | The first thing a keyboard user reaches on every Wayfold page. It stays out of sight until focused, then appears over the site header and jumps straight to the  |
| [Site header](components/site-header.html) | The top bar on every Wayfold page: the wordmark with its Toronto tag, the four sections, the one main action ("Sell your car" for members, "Create account" for  |
| [Site footer](components/site-footer.html) | The quiet end of every browse and profile page: the Wayfold name and line, a short row of links, and the copyright. |
| [Section link](components/section-link.html) | Full-width rows that list where you can go: the items of the phone site menu. Each row is a whole link, 72px tall, separated by hairlines. |

### Layout and overlays

| Page | Purpose |
|---|---|
| [Container and page layout](components/container.html) | The handful of layout classes every Wayfold page is built from: a centred container, vertical stacks, wrapping clusters, the page head, three card grids, the tw |
| [Dialog](components/dialog.html) | A modal panel for a short task that keeps the page underneath: message a seller, ask about a deal, recommend a provider, add a car to your garage, or confirm de |
| [Sheet](components/sheet.html) | A full-height panel for the site menu: full screen on a phone, a 28rem panel from the right edge on wider screens. It holds the destinations that do not fit the |
| [Popover](components/popover.html) | A small raised panel anchored to its trigger. Wayfold uses one: the account menu under the header avatar. |

### Data display

| Page | Purpose |
|---|---|
| [Card](components/card.html) | A card is the bordered surface that groups one topic: a vehicle's details, the price rating, a seller, a product, a post. It is the most-used container in Wayfo |
| [Vehicle card](components/vehicle-card.html) | The vehicle card shows one car for sale in a grid: photo, price, year-make-model, mileage and area, and who is selling it. Private and dealer listings use the s |
| [Gallery](components/gallery.html) | The gallery shows a vehicle's main photo at the top of its detail page. |
| [Detail list](components/detail-list.html) | The detail list shows a vehicle's specifications as label and value pairs: mileage, condition, location, features. |
| [Avatar](components/avatar.html) | The avatar shows a member's initials in a circle beside their name on their profile and in the site header. |
| [Tag and church tag](components/tag.html) | A tag is a small outlined label. The church tag is the tag Wayfold uses to show a member's home church as a trust signal. |
| [Badge](components/badge.html) | A badge is a short status word with a dot. Wayfold uses it for a vehicle's automatic price rating. |
| [Post and recommendation](components/post.html) | A post is a member's feed entry; a recommendation is a quoted endorsement of a provider or product. Both are cards with an author line. |

### Feedback

| Page | Purpose |
|---|---|
| [Alert](components/alert.html) | An alert is an inline message about the page or form the user is on: a failed load, fields to fix, a lockout or a saved change. |
| [Toast](components/toast.html) | A toast is a short message in the corner after something finishes in the background: a recommendation posted, a vehicle listed, a save that failed. |
| [Skeleton](components/skeleton.html) | A skeleton is grey placeholder lines that hold a card's shape while its content loads. |

### Patterns

| Page | Purpose |
|---|---|
| [Forms](patterns/forms.html) | Wayfold asks members for a sign-in, a sign-up, their settings and a car listing, and asks providers for a business profile. Every form is one column in a card,  |
| [Feedback and loading](patterns/feedback-and-loading.html) | How Wayfold tells members that something is happening, worked, or failed: skeleton cards while a page loads, busy buttons while a form sends, alerts inside the  |
| [Empty and error states](patterns/empty-and-error-states.html) | When a Wayfold list has nothing to show, or a page cannot load, the page keeps its heading and filters and puts one plain message in the space the content would |
| [Navigation and page structure](patterns/navigation.html) | Every Wayfold page has the same frame: skip link, site header with the primary navigation, one main that opens with a page head, and the site footer. Below 768  |
| [Dialogs and overlays](patterns/dialogs-and-overlays.html) | Wayfold uses three overlays: a modal dialog for short tasks that belong to the page behind it (add a car, ask about a deal, message the seller, recommend, delet |
| [Data tables and lists](patterns/tables-and-lists.html) | Wayfold shows collections as lists, not tables: a grid of vehicle cards for search, garages and dealer inventory, a grid of cards for providers and products, an |
| [Notifications](patterns/notifications.html) | Wayfold tells members and dealers what just happened without moving them: a toast for the outcome of something they did (a recommendation posted, a vehicle list |
| [Content and tone](patterns/content-and-tone.html) | Wayfold sounds like a trusted neighbour from church who knows cars: warm, plain and honest about money. It speaks Canadian English to people across Toronto and  |

## Tokens

| File | Role |
|---|---|
| [`tokens/tokens.css`](tokens/tokens.css) | Single source of truth: primitives, semantic tokens, light and dark themes |
| [`tokens/tokens.json`](tokens/tokens.json) | DTCG export, generated by `tokens_to_json.py` |
| [`tokens/contrast-pairs.json`](tokens/contrast-pairs.json) | Every foreground/background pair the components rely on, checked in both themes |
| [`assets/components.css`](assets/components.css) | Component stylesheet, tokens only, with `data-state` hooks |

## Drift found in the mocks

| Mock | Issue | Resolution |
|---|---|---|
| sign-in, sign-up submitting; contact-dealer, ask-expert, recommend, delete-vehicle busy | Busy buttons swap their label ("Signing in…", "Sending…", "Deleting…") while editors and settings keep it | Busy buttons keep their label with `aria-busy`; progress goes in a status line |
| All form dialogs | No Close button; panel is not a `<form>`; submit is `type="button"` | Close in every header; panel is the form; action is `type="submit"` |
| Error summaries across forms | Four different titles | Always "Check these fields" |
| Load errors (all list pages) | "Could not load this page" / "Something went wrong"; Try again outside the alert | "Could not load <thing>"; Try again directly after the alert |
| Empty states (home, vehicles, providers, products, member, dealer-inventory) | Same generic copy everywhere | Per-screen copy with an action that adds the first item |
| vehicles/no-results | Mentions a category filter vehicles doesn't have; filters disappear | Keep the filters; name the real ones |
| vehicles/default | Filters lack price range and model (L2-008); mis-encoded middle dot | Flagged for the mock; use UTF-8 "·" |
| vehicle-editor/invalid | Valid year "2015" flagged "Enter a year" | Error must match the actual problem |
| vehicle-editor | No `inputmode` / `autocomplete` | Part of the text-field spec |
| All forms | No `autocomplete` on email, name, password | Added to the spec |
| settings | "(optional)" typed into labels; "GTA area"; home-church help not linked | `.optional` span; "GTA municipality"; `aria-describedby` and indent |
| sign-up | 12-character password rule only appears as an error | Shown as help text |
| recommend | 10–500 character rule only after submit | Shown as help text |
| provider-editor | Financing credential field shown for every category | Only for Financing |
| providers, products | Search input labelled "Search", same as the button | "Search providers", "Search products" |
| Filter selects | "Any" option has no `value=""` | Add `value=""` |
| Header (all pages) | Menu and avatar are links with `aria-haspopup` | Buttons with `aria-expanded` |
| site-menu | No backdrop; Close is a link home; Sign out is a link | Backdrop; Close button returns focus to Menu; Sign out posts |
| account-menu | Modal dialog wrapping `role="menu"`; no CSS | Non-modal popover with a labelled list of links; CSS added |
| site-menu, account-menu | "Your garage" and "Your profile" both link to member/own | One row |
| All footers | Hyphen in "© 2026 Wayfold - Toronto and the GTA"; no `aria-current` | Middle dot; mark the current page |
| Detail pages | No `aria-current` on the parent section | Mark the parent section |
| ask-expert, contact-dealer success | "Posted / Your message is available now"; Done goes to the feed | "Message sent" / task-specific copy; Done returns to the vehicle |
| dealer-inventory/default | "Delete selected vehicle" with no way to select | Edit and Delete on each listing |
| Toasts | Danger `role="alert"` nested in polite region; no dismiss; danger never times out; vague copy | Separate assertive region; Dismiss button; Try again on danger; name the item |
| Price-rating badges | Only "Good" and "Fair" shown; cards give rating as plain text | Great/Good use `badge--success`, Fair/High neutral; High is never red |
| home/feed | Like button has no `aria-pressed` | Documented as a toggle button |
| Vehicle cards | Title is a link, not a heading | Kept; flagged for review |
| Card mocks | `.card` and `.card.stack` used for the same job | `.card.stack` when a card has more than one child |
| All card mocks | `.list__meta` used 54 times with no CSS | Muted body-small rule added |
| vehicle-detail | `.gallery__main` had no placeholder fill | `--color-bg-photo` |
| `.vehicle-grid` | `auto-fit` stretched a single car full width | `auto-fill`, like garage and directory grids |
| `.garage-card img` | No aspect ratio | 4:3 like vehicle cards |
| `.segmented` | Defined twice; current item hard-coded `font-weight:700` | Chip style kept; semibold token |
| providers/default | No category link marked current | "All" is current by default |
| provider pages | Trailing space in eyebrow; name repeated in first card | Trimmed; page head only |
| member/default | Member name is the h1 and again an h2 | h1 only |
| Header avatar | Named only by initials | `aria-label` with the member's name |
| Skeleton mocks | Line widths are inline styles | Kept |
| loading mocks | One card of text skeletons; page head changes between loading and default | Skeleton cards shaped like the grid; head identical |
| `ui.css` | Mock-local component CSS | Moved into `components.css` (with the hairline token for 1px borders) |

## Open questions

- Vehicle-card titles as links, not headings: confirm heading navigation needs.
- Vehicles filters: add price range and model per L2-008 in the mocks.
- Radio buttons are documented on the choice page but no mock uses them yet.

## Changelog

- **v1.0 — 15 October 2026.** Re-extracted for Wayfold. Deleted 39 component pages and their CSS that
  belonged to the previous product and no Wayfold mock uses (alert info actions, admin rows, breadcrumb,
  chips, compare bar and table, disclosure, editor layout, empty state, error page, file upload, form
  layout, guide entry, image manager, lightbox, location card, map, price block, progress, review layout,
  score, shot grid, signup, spinner, stat tile, status label, table, video poster and others). Added
  segmented control, filters, section link, card, vehicle card, gallery, detail list, avatar, post and
  recommendation, and the account-menu popover. Token names and values unchanged; contrast pairs cut
  from 118 to the ones the components use.

## Verification

- `check_design_system.py docs/design-system`: 0 errors.
- `check_contrast.py docs/design-system/tokens/tokens.css`: both themes pass.
