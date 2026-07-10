# Handoff: Sassy's Bakery Website Redesign

## Overview
A full redesign of mysassys.com (family-owned bakery/deli/pizzeria, 225 King St, Thorndale ON), replacing the current unmaintainable GoDaddy WordPress site. The design covers the public marketing site (Home, Menu, Gallery, About, Contact), a retail pickup **ordering flow** (browse → cart → pickup time → payment method), and a **wholesale portal** (passcode login → reorder/quick-add/catalog dashboard) for stores/restaurants that buy bread and baking wholesale.

`PLAN.md` (included in this folder) is the accompanying **technical architecture document** — it specifies the real stack (Next.js on Cloudflare, Neon Postgres, Drizzle, Clover POS integration, Auth.js passcode auth, Resend email, etc.), data model, auth model, and phased build plan. Build against that plan; this README documents the **visual and UX design** that should be implemented on top of it.

## About the Design Files
`Sassys-Bakery-design.dc.html` is a **design reference / clickable prototype**, built as a single interactive HTML file — not production code to copy directly. It demonstrates the intended look, layout, copy, and click-through behavior (page navigation, add-to-cart, wholesale login toggle, mobile nav, responsive breakpoint) using static/mock data. The task is to **recreate this design in the target codebase** — Next.js + React per PLAN.md — using real components, real data from Neon/Drizzle, real auth, and the real Clover integration. Do not `<iframe>` or ship the HTML file itself.

Open `Sassys-Bakery-design.dc.html` directly in a browser to click through every screen and state described below.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and the responsive/mobile behavior are final — recreate pixel-close using the codebase's component library (build one with Tailwind + shadcn/ui or Radix per PLAN.md if none exists). Menu item names/descriptions are drawn from Sassy's real recipe sheets; prices shown are **illustrative placeholders** — replace with real pricing before launch.

---

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| Cream (background) | `#FBF4E8` | Page background, default section bg |
| Cream alt (card/section) | `#F4E8D3` | Alternating section backgrounds, subtle cards |
| Ink (primary text) | `#2B2118` | Headlines, primary text, footer background |
| Ink muted | `#4A3E32` / `#5C4F41` | Body copy |
| Muted label | `#6B5D4F` / `#8A7B6A` | Secondary/meta text |
| Forest green (brand primary) | `#1E6B3B` | Badges, active nav/tab state, category "Add" buttons, wholesale portal accents |
| Forest dark | `#123D22` | Wholesale portal background, utility ribbon, footer accents |
| Sassy red (brand accent / CTA) | `#D2352B` | Primary CTA buttons ("Order Pickup", "Place Order"), price text, active link accents |
| Red dark (shadow) | `#A32620` | 3–4px hard drop-shadow under red buttons (retro/playful button style) |
| Gold (secondary accent) | `#DDA43A` | "Fresh Since Day One" badge, wholesale CTA button, specials card accent |
| Line/border | `#E4D3B0` | Card borders, dividers, input borders |
| Footer bg | `#2B2118` | Footer |
| Footer text | `#D9CDBC` / `#B7A891` | Footer copy/links |

Logo (`assets/sassys-logo.png`) is the existing hand-drawn Sassy's mascot mark — used as-is in nav (58px tall desktop / 44px mobile) and footer (60px).

### Typography
Three-font system, loaded from Google Fonts:
- **Baloo 2** (weights 500/600/700/800) — display/playful voice: H1 hero headline, all buttons, nav links, category labels, prices, badges. Matches the cartoon logo's personality.
- **Lora** (weights 500/600/700, italic 500) — editorial serif: section H2/H3 headings ("This week at Sassy's", "Our Story", card titles). Gives the "polished" half of the brand mix.
- **Work Sans** (weights 400–700) — body copy, form labels/inputs, footer text, eyebrow labels.

Type scale (desktop → mobile):
- Hero H1: 58px → 38px, weight 800, line-height 1.05
- Section H2: 32px → 24px, weight 600
- View title H1 (Menu/Order/Gallery/About/Contact): 38px → 28px, weight 600
- Card title (Lora): 19–21px, weight 600
- Body: 16–18px → 16px, line-height 1.6–1.75
- Meta/label: 12–14px

### Spacing & Shape
- Max content width: 1280px, centered, side padding 28px desktop / 20px mobile.
- Section vertical padding: 64px desktop / 44px mobile (large sections), 50px/36px (banners).
- Card radius: 14–20px. Pills/buttons: fully rounded (999px radius), except wholesale-portal secondary buttons.
- Card border: 1px solid `#E4D3B0` throughout — the one consistent "container" treatment (no left-border-accent cards, no heavy shadows except the deliberate hard drop-shadow on primary CTAs and hero image).
- Primary CTA buttons use a **hard 3–4px offset shadow** in the red-dark/gold-dark tone (retro signage feel) rather than a soft blur shadow — this is a deliberate signature detail, keep it.

---

## Screens / Views

The prototype is a single-page app with client-side view switching (no real routing) — implement as real routes in Next.js App Router per PLAN.md's file layout (`/`, `/menu`, `/gallery`, `/about`, `/contact`, `/order`, `/wholesale`).

### 1. Nav (persistent header)
- Sticky top, translucent cream background with blur, 2px bottom border.
- Above it: a thin dark-green **utility ribbon** ("Family owned since day one · 225 King St, Thorndale ON") — always visible, non-sticky, scrolls away with the page (only the nav below it is sticky).
- Desktop (≥860px): logo left · nav links (Home/Menu/Gallery/About/Contact, active = dark pill) center-right · "Wholesale Login" text link + red "Order Pickup" pill button, far right.
- Mobile (<860px): logo left · compact red "Order" button + hamburger icon (☰ / ✕ toggle) right. Tapping hamburger opens a dropdown panel below the nav bar with all nav links stacked (including Order Pickup and Wholesale Login), each a full-width tappable row, active row highlighted with cream-alt background.
- Breakpoint: **860px** (not the usual 768px — chosen because the desktop nav's five text links + two CTAs need the extra room before wrapping).

### 2. Home
1. **Hero** — two-column (text left, photo right) on desktop; stacks to a single column on mobile with the photo appearing *above* the text (order swapped via CSS `order`, image height 260px mobile vs 440px desktop). Left: forest-green "Thorndale, Ontario · Family Owned" pill badge, big Baloo 2 headline ("Bakery. Deli. Pizzeria. **All Sassy's.**" — last line in red), supporting paragraph, two CTA buttons (red "Order Pickup", outlined "View Full Menu"). Right: hero photo (image slot) with a soft cream-alt rounded-rect offset behind it for depth, and a rotated gold circular "Fresh Since Day One" badge overlapping its top-right corner (positioned safely inside the image's own bounding box — do not let it overhang the column edge, this caused clipping bugs in the prototype).
2. **Weekly specials** — H2 + 3-up card grid (1-up mobile), each card has a colored 4px top accent bar (red/gold/green rotating), small uppercase tag, Lora title, body copy. Content is illustrative — wire to the real `weekly_specials` table per PLAN.md (date-scoped, admin-edited).
3. **"What we make" category grid** — cream-alt full-width band, 6-up photo tile grid (2-up mobile) — Pizza, Subs & Sandwiches, Chicken, Salads, Breakfast, Fresh Baking. Each tile is a photo + label, clicking navigates to Menu filtered to that category. Tiles lift on hover (translateY(-4px) + shadow).
4. **About snippet** — two-column photo + story teaser, "Read our story →" link to the About view. Stacks on mobile (photo above text).
5. **Wholesale teaser banner** — full-width forest-green band, gold "Wholesale Login →" CTA, row layout desktop / stacked column mobile.

### 3. Menu
Category pill filter bar (Pizza / Subs / Burgers & Wraps / Chicken Meals / Salads / Breakfast — active pill filled dark green) above a 2-column card grid (1-column mobile) of item cards: name (Baloo 2), one-line description, price in red, right-aligned.

### 4. Order (Pickup)
Two-column layout (stacks to one column, cart below items, on mobile): left = same category pills + item grid as Menu but each card has an "Add +" button; right = sticky cart panel (`position:sticky` desktop only — static on mobile) showing line items with qty steppers, subtotal, pickup date/time native inputs, a two-option payment selector ("Pay online now (card)" / "Pay at store" — click to select, selected state = green border + tinted background), and a "Place Order" button (disabled/greyed until cart has ≥1 item). Placing an order swaps the whole view to a confirmation card (checkmark, "Order sent to the kitchen!", pickup time recap, "Start a new order" reset).

Behavior to implement for real: Clover Hosted Checkout redirect for "pay online", Clover Orders API push for "pay at store" (ticket prints either way), catering-flag review-queue logic — all per PLAN.md's Retail ordering + Clover and Catering orders sections.

### 5. Wholesale Portal
Full-bleed dark forest-green (`#123D22`) background, distinct from the rest of the site (signals "you've left the public site").
- **Logged out**: centered cream card, email + 6-digit passcode fields (letter-spaced dots), "Sign In" button, "New wholesale account? Contact us" link to Contact view. Recreate real behavior per PLAN.md: admin-issued initial passcode, forced passcode change on first login, rate limiting, 30-day sliding session.
- **Logged in**: header ("Welcome back, {business name}" + Sign out); top row = "Reorder last week's order" card (line items + one-click reorder button with total) and a persistent-cart summary card, side by side (stacks on mobile); "Quick add" 4-up (2-up mobile) grid of the customer's top items with inline Add buttons; full catalog 3-up (1-up mobile) grid with item name, detail (case size/MOQ/availability window), price, Add button; "Order history →" link.

### 6. Gallery
H1 + intro line, 4-up (2-up mobile) grid of photo slots labeled by category (Cakes/Breads/Storefront/Catering) — wire to `/gallery` with lightbox-on-click per PLAN.md.

### 7. About
H1, two-column (stacks mobile) photo + two paragraphs of brand story, then a 3-up (1-up mobile) row of value-prop cards (Family owned / Made to order / Local wholesale) on cream-alt background chips.

### 8. Contact
H1, two-column (stacks mobile): left = map/storefront photo slot, address, phone, hours table; right = contact form card (name/email/message, red submit button — static in the prototype, wire to a real submit action).

### 9. Footer
Always visible below every view. Dark ink background, 4-column grid (2-column on mobile): logo + one-line description; Explore links; Order links (Order Pickup, Wholesale Login); Visit (address/phone). Copyright line below a divider.

---

## Interactions & Behavior
- **View switching**: click any nav item / CTA / footer link → swap active view, scroll to top. No page reload in the prototype; implement as real Next.js route navigation.
- **Hero**: no interaction beyond the two CTAs (this prototype originally had an A/B hero comparison toggle — that has been **removed**; ship only the "Playful" version documented above).
- **Category tiles / pills**: click sets the active category filter (Menu and Order share the same 6 categories) and re-renders the item grid; active pill = filled dark green.
- **Cart**: "Add +" on an item card adds one unit (or increments existing line). Cart panel qty steppers (− / +) increment/decrement; hitting 0 removes the line. Subtotal recomputes live.
- **Payment method selector**: single-select between two custom radio-style cards (not native radio buttons) — click toggles selection styling (green border + tint).
- **Place Order**: disabled (greyed, `cursor:not-allowed`) while cart is empty; enabled once ≥1 item added; click swaps to the confirmation state.
- **Wholesale login**: any non-empty email/passcode submit ("Sign In") flips to the logged-in dashboard in the prototype (no real validation) — implement real Auth.js credentials-provider validation, lockout, and forced-passcode-change-on-first-login per PLAN.md.
- **Mobile nav**: hamburger toggles an inline dropdown panel (not an overlay/drawer) that pushes content down; auto-closes on navigation or when the viewport crosses back above 860px.
- **Responsive breakpoint**: single breakpoint at **860px** width, tracked via a `resize` listener (not CSS media queries, since the prototype is built with inline styles) — implement with real CSS media queries / Tailwind's `md:` breakpoint (≈768–896px, use judgement to match) in production.

## State Management (prototype)
- `view`: current screen id.
- `menuCat` / `orderCat`: active category filter, independent per view.
- `cart`: map of item id → `{ ...item, qty }`.
- `pickupDate`, `pickupTime`, `payMethod`, `orderPlaced`: order flow state.
- `wsLoggedIn`, `wsEmail`, `wsPasscode`: wholesale auth state (mock — no real validation).
- `isMobile`, `mobileNavOpen`: responsive/nav UI state.

In production, replace all of this with real data per PLAN.md's schema (`menu_items`, `weekly_specials`, `wholesale_customers`, `wholesale_items`, `orders`, `order_items`, etc.) and real session state from Auth.js.

## Assets
- `assets/sassys-logo.png` — Sassy's existing brand mark (mascot + wordmark), sourced from the current site. Reuse as-is; do not redraw.
- All photography in the design (hero, category tiles, about, gallery, contact map) is represented by **drag-and-drop image placeholders** in the prototype — no stock or generated imagery was used. Real photos (storefront, food, family) need to be sourced/shot and dropped in before launch.
- Menu copy was distilled from Sassy's actual in-store recipe/build sheets (photographed by the owner) into customer-facing names + short descriptions — internal prep details (gram weights, layering order) were intentionally omitted as they're not customer-facing.

## Files
- `Sassys-Bakery-design.dc.html` — the full interactive design reference described above. Open directly in any browser to click through every screen and resize the window to see the mobile layout.
- `assets/sassys-logo.png` — brand logo asset.
- `PLAN.md` — the technical architecture and implementation plan (stack, data model, auth, Clover integration, phased build plan) to build this design against.
