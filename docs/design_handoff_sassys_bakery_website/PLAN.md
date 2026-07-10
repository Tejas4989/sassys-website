# Sassy's Bakery — Website Modernization Plan

> Status: **ready for approval.**

## Context

Sassy's is a family-owned bakery/deli/pizzeria in Thorndale, ON (225 King St). The current site (`mysassys.com`) is a GoDaddy WordPress/PHP build showing About, Menu, Contact, hours, and weekly specials. There is no online ordering, no wholesale portal, and content edits require WordPress admin.

We are rebuilding it to serve **two distinct audiences**:

1. **Retail walk-in customers** — browse menu, place pickup orders with scheduled times, pay online via the existing Clover POS.
2. **Wholesale accounts** (convenience stores, restaurants, golf courses ordering breads/buns/baked goods) — dedicated login-gated portal with a catalog and dead-simple repeat-order UX. Today these orders happen by phone/email; we're formalizing them.

Constraints:
- **Target hosting cost: $0/month** (bakery-friendly).
- Content must be editable by **non-technical family members**, not just the owner.
- The Clover POS is the source-of-truth for retail transactions and must integrate with any online ordering.
- Two different bakers work retail vs. wholesale shifts — dashboards must be role-separated.

Intended outcome: a modern, mobile-first, fast site that (a) presents the brand professionally, (b) captures retail pickup orders online with real-time baker visibility, (c) provides a repeat-friendly wholesale portal, and (d) is trivially editable by the family.

---

## Locked decisions (as of grilling Q1–Q5)

### Architecture — Fully on Cloudflare
- **Frontend + backend**: Next.js (App Router) deployed via `@opennextjs/cloudflare` adapter to Cloudflare Pages/Workers.
- **Database**: Neon serverless Postgres (free tier — 0.5 GB storage, 190 compute-hrs/mo). Point-in-time restore for 7 days.
- **ORM**: Drizzle (edge-runtime friendly, first-class Postgres support).
- **Object storage**: Cloudflare R2 for menu images, wholesale catalog images, gallery photos.
- **Secrets/config**: Cloudflare Worker secrets.
- **Email delivery**: Resend (free tier — 3k emails/mo).
- **Rationale**: single-vendor edge stack, zero ops burden, portable off CF later if needed (Neon → Supabase is a drop-in). No OCI VM to babysit.

### Wholesale auth — Admin-issued hybrid passcode
- Admin creates account in the internal dashboard → system generates initial **6-digit** passcode.
- Welcome email sent to customer: login URL + email + initial passcode.
- On **first login**, customer is forced to set their own 6-digit passcode.
- Sessions: httpOnly Secure SameSite=Lax cookie, **30-day sliding expiry**.
- Admin capabilities: rotate passcode (invalidates current), disable/enable account, view login history.
- Rate limits: 5 wrong attempts per email in 15 min → 1 hr lockout; 20 attempts per IP per hour globally.
- Passcode stored as argon2/bcrypt hash — never plaintext, never displayed after generation.
- Library: **Auth.js (NextAuth v5)** with a custom credentials provider.

### Notifications — split retail vs. wholesale
- **Wholesale baker dashboard**: no polling. Just a "next-day queue" view. Baker signs in ~10 PM and loads tomorrow's orders. Zero background load.
- **Retail baker dashboard**: React Query with **5s `refetchInterval`** on `/api/orders/retail/queue`. Only active while tab is visible.
- **Customer confirmation (order placed)**: transactional email via Resend + in-portal status page.
- **Customer notification (order ready)**: Web Push via VAPID (free, works on iOS 16.4+/Android/desktop) + email fallback for those who declined push.
- **Baker accounts are role-separated**: `role = 'baker_retail'` vs. `role = 'baker_wholesale'`. Different dashboards, different notification triggers.

---

### Retail ordering + Clover
- Customer picks items → picks any pickup time (no slot capacity limits — staff handles surge).
- Customer chooses **pay online now** or **pay at store**.
  - **Pay now**: Clover **Hosted Checkout** (redirect + return). Lowest PCI scope (SAQ A). Webhook confirms → order marked paid, ticket printed via Orders API.
  - **Pay at store**: Order pushed to Clover POS via **Orders API** at submit time so the ticket prints and the cashier can settle payment at pickup. Customer receives confirmation email either way.
- Clover webhook endpoint at `/api/webhooks/clover` — HMAC signature verified, idempotency-keyed by Clover order id.
- Clover merchant credentials stored in Cloudflare Worker secrets.

---

### Content management — custom admin panel
- No third-party CMS. `/admin/*` routes in Next.js, gated by roles (`admin`, `baker_retail`, `baker_wholesale`).
- Screens: menu items, categories, weekly specials (date-scoped), hours + holiday overrides, wholesale catalog (with wholesale price, MOQ, case size), wholesale accounts (create/rotate passcode/enable-disable), photo gallery, admin users.
- Rich text: **TipTap** for descriptions and specials.
- Images: uploaded to R2 via presigned URLs; on-the-fly resize via Cloudflare Images free tier (5k transforms/mo) or in-Worker resize.
- Server-side validation via Zod; optimistic UI via React Query.
- All content lives in Neon Postgres alongside orders → SQL joins for reporting (top-selling items, best wholesale customers, etc.).

---

### Wholesale portal
- **Auth model**: hybrid admin-issued passcode (see auth section above). Admin creates account, generates initial 6-digit passcode, emails welcome link; customer forced to set own passcode on first login; 30-day sliding sessions.
- **Landing page after login** (in this order):
  1. **"Reorder last week's order"** card with preview of items, quantities, total, and prior pickup-vs-delivery choice. One click loads it into cart.
  2. **Quick-add tiles** for the customer's top-8 previously-ordered items with `[+]` buttons.
  3. **Cart summary** (persistent across sessions).
  4. **Full catalog** by category.
  5. **Order history** at `/wholesale/history` with reorder-any-past-order buttons.
- **Cart persistence**: cart lives in Neon, keyed to `wholesale_customer_id`. Partial-fill across days is fine. "Clear cart" resets.
- **Payment model**: **net-30 invoicing, no in-portal payment in v1.** Orders are captured only. Existing accounting (QuickBooks or similar) issues monthly invoices. Zero PCI overhead for wholesale.
- **Fulfillment**: pickup at bakery OR delivery selectable per order. Reorder-last preserves the prior choice. Driver runs the route by scheduled delivery date (same as current offline process).
- **Wholesale catalog attributes** beyond retail menu items: wholesale price, MOQ (min order qty), case size (order multiples), availability window (e.g., seeded rye Mon/Wed/Fri only). Per-customer pricing overrides deferred to a later version.
- **Submit-order flow**: pick delivery date OR pickup date+time → optional notes ("no seeds on Fridays") → confirm → order emailed to customer + surfaced on wholesale baker dashboard.

---

### Operations & launch
- **Free-tier monitoring**: alert to admin email at 70% of any monthly limit (Neon compute-hrs, Workers requests, Resend emails, R2 storage, CF Images transforms). On Neon and Workers, configure hard rate-limit rather than auto-bill — we prefer 429s over surprise invoices.
- **Observability**: Cloudflare Web Analytics (free, cookieless — no consent banner needed) + Sentry free tier (5k errors/mo) for JS/Worker crash tracking + UptimeRobot free (5-min pings on `/`, `/api/health`, `/wholesale/login`).
- **Backups**: Neon 7-day PITR + nightly `pg_dump` from a CF Cron Trigger to R2 with 30-day retention.
- **Realistic overage path**: Resend hits first if volume grows → $20/mo unlocks 50k/mo. Everything else has years of runway at bakery volume.

### Legal & accessibility
- **Privacy policy + TOS** generated via Termly template (industry-standard PIPEDA/CASL language). **No lawyer review** — Hosted Checkout keeps card data off our systems, we only store emails/order history, and the risk is judged acceptable for a family bakery.
- **Cookie consent**: not required since Cloudflare Web Analytics is cookieless. If we ever add Google Analytics, add a consent banner.
- **PCI**: SAQ A (annual self-attestation, ~1hr paperwork). Hosted Checkout keeps us here.
- **Accessibility**: WCAG 2.0 AA baseline (semantic HTML, keyboard nav, alt text on all images). axe-core linting in CI. Ontario AODA applies to public-facing sites.
- **English-only for v1.** Design components as i18n-ready (no hardcoded strings — use a message catalog) so French can be added later without a refactor.

### DNS cutover from GoDaddy WordPress
1. Move DNS to Cloudflare (CF becomes the nameserver).
2. Deploy new site to `v2.mysassys.com` staging subdomain.
3. Family loads menu/hours/catalog into custom admin. Photos uploaded.
4. Pilot with 1–2 wholesale customers on staging for ~1 week.
5. Archive final WordPress content as static HTML snapshot (kept for reference in R2).
6. Cutover: apex DNS `mysassys.com` points to CF Pages. CF Page Rules redirect old URLs (`/our-menu/` → `/menu`, etc.).
7. Keep GoDaddy WordPress hosting live for 30 days as rollback net, then cancel.

---

### Catering orders (v1 = pizza / subs / sides / wings, no cake ordering yet)
- Customer uses the regular retail catalog. There is no separate "cake order" flow.
- **Catering flag** on the order is set when any of: total > **$200 threshold** (config), scheduled pickup/delivery > **48 hours out**, or customer explicitly ticks "This is a catering order."
- Flagged orders enter an **admin review queue** rather than immediately hitting Clover.
- Employee reviews: if no questions → approves → order proceeds to Clover Hosted Checkout (pay online) or in-store settle (pay at pickup) and prints to POS. If questions → employee emails/phones the customer, updates the order, then approves.
- Non-catering retail orders skip the review queue entirely and go straight to Clover.

### Gallery
- `/gallery` page with a categorized grid (Cakes / Breads / Storefront / Catering). Lightbox on click.
- Photos uploaded via admin panel → R2. Categorization + captions edited in admin.
- On-the-fly resize via Cloudflare Images transforms (`?width=800&format=auto`). WebP/AVIF served automatically.

### Image pipeline
- **Upload**: admin drag-drops → Next.js presigned URL → direct browser-to-R2 PUT (avoids proxying large uploads through Workers).
- **Serve**: `<Image>` component wrapping CF Images transforms. Sizes: 400 (thumb), 800 (card), 1600 (full).
- **Storage budget**: 200-500 MB for full catalog + gallery. Well inside 10 GB R2 free tier.

---

## Repository layout (single Next.js app)

```
sassys/
├── src/
│   ├── app/
│   │   ├── (public)/              # marketing site (SSG-friendly)
│   │   │   ├── page.tsx           # home
│   │   │   ├── menu/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── order/             # retail online ordering
│   │   ├── wholesale/             # login-gated portal
│   │   │   ├── login/
│   │   │   ├── (authed)/
│   │   │   │   ├── page.tsx       # landing: reorder + quick-add + catalog
│   │   │   │   ├── catalog/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── history/
│   │   ├── admin/                 # role-gated admin
│   │   │   ├── (dashboard)/
│   │   │   ├── menu/              # menu items + categories
│   │   │   ├── specials/
│   │   │   ├── hours/
│   │   │   ├── catalog/           # wholesale catalog
│   │   │   ├── accounts/          # wholesale accounts CRUD
│   │   │   ├── gallery/
│   │   │   ├── users/             # admin/baker users
│   │   │   └── review-queue/      # catering approval
│   │   ├── baker/
│   │   │   ├── retail/            # 5s polling queue
│   │   │   └── wholesale/         # next-day queue (no polling)
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── webhooks/clover/
│   │       ├── orders/
│   │       ├── push/subscribe/
│   │       └── health/
│   ├── db/
│   │   ├── schema.ts              # Drizzle
│   │   └── client.ts              # Neon HTTP driver
│   ├── lib/
│   │   ├── auth.ts                # Auth.js config, custom passcode provider
│   │   ├── clover.ts              # Hosted Checkout + Orders API client
│   │   ├── email.ts               # Resend wrappers
│   │   ├── push.ts                # VAPID web push
│   │   ├── r2.ts                  # presigned URLs
│   │   └── rate-limit.ts          # login rate limit (KV or DB-backed)
│   └── components/                # shared UI (TipTap editor, image uploader, etc.)
├── open-next.config.ts            # CF adapter config
├── wrangler.toml                  # CF Pages/Workers config
├── drizzle.config.ts
└── package.json
```

## Data model (Drizzle / Neon Postgres) — key tables

- `users` (`id`, `email`, `role`, `password_hash`, ...) — admin + bakers + wholesale customers unified with a role column.
- `wholesale_customers` (`id`, `user_id`, `business_name`, `contact_phone`, `default_delivery_day`, `default_fulfillment`, `passcode_hash`, `passcode_must_change`, `is_active`, ...).
- `menu_categories`, `menu_items` (retail).
- `wholesale_categories`, `wholesale_items` (`price_cents`, `moq`, `case_size`, `availability_days` json, ...).
- `weekly_specials` (`starts_on`, `ends_on`, `title`, `body`, `image_id`).
- `hours` + `holiday_overrides`.
- `wholesale_carts` (persistent, per customer) + `wholesale_cart_items`.
- `orders` (`id`, `type` = 'retail'|'wholesale', `customer_id`, `status`, `fulfillment` = 'pickup'|'delivery', `pickup_at`, `delivery_date`, `total_cents`, `payment_method` = 'clover'|'pay_in_store'|'net30', `is_catering`, `clover_order_id`, `notes`, ...).
- `order_items` (denormalized `name`, `price_cents`, `qty` at time of order).
- `push_subscriptions` (customer web push endpoints).
- `login_attempts` (rate limiting).
- `admin_audit_log` (passcode rotations, account disables).

## Implementation phases

### Phase 0 — Foundations (~3–4 days)
- Init repo, Next.js 15 App Router, TypeScript, ESLint, Prettier.
- Configure `@opennextjs/cloudflare` + Wrangler; deploy hello-world to CF Pages.
- Neon project + Drizzle schema + migrations.
- R2 bucket + presigned URL helper.
- Auth.js v5 with custom passcode credentials provider (skeleton).
- Sentry, CF Web Analytics, health endpoint.
- GitHub Actions CI: typecheck + `drizzle-kit generate` check + lint.

### Phase 1 — Public marketing site + admin foundations (~1 week)
- Home / About / Contact / Menu / Hours / Gallery pages, mobile-first.
- Design system: Tailwind + component primitives (Radix or shadcn/ui).
- Admin skeleton: login (email + password for staff), role-gated layout, users CRUD.
- Menu items + categories + hours + specials + gallery admin screens.
- Public pages read from Neon; ISR-tagged so admin edits reflect within seconds.

### Phase 2 — Retail online ordering + Clover integration (~1.5 weeks)
- `/order` flow: category browse → item detail → cart → pickup date+time → payment method (online / at store) → confirm.
- Clover Hosted Checkout redirect flow; webhook handler with HMAC verification + idempotency.
- Clover Orders API push (both payment paths — needed for POS ticket printing).
- Catering flag logic + `/admin/review-queue` screen for employee approval.
- Order confirmation email (Resend).
- Retail baker dashboard `/baker/retail` with 5s React Query polling on visible tab.

### Phase 3 — Wholesale portal (~1.5 weeks)
- Public `/wholesale/login` (email + passcode) with rate limiting + lockout.
- First-login "set your own passcode" flow.
- Landing page: reorder-last card + quick-add tiles + persistent cart + catalog + history.
- Wholesale catalog admin: categories, items, MOQ, case size, availability.
- Wholesale accounts admin: create account, generate passcode, rotate, disable, view history.
- Order submit → email confirmation + surfaced on `/baker/wholesale` (next-day queue, no polling).
- Reorder-last preserves prior fulfillment (pickup vs delivery) choice.

### Phase 4 — Notifications + operational hardening (~5 days)
- Web Push (VAPID) subscription flow for retail customers.
- "Order ready" trigger from baker dashboard → push + email to customer.
- Free-tier ceiling alerts (nightly cron via CF Trigger).
- Nightly `pg_dump` → R2 with 30-day retention.
- UptimeRobot config (external).
- axe-core in CI; fix any WCAG AA violations.

### Phase 5 — Launch prep + cutover (~1 week)
- Termly-generated privacy/TOS pages.
- SEO: sitemap.xml, robots.txt, LocalBusiness JSON-LD, redirects for legacy URLs.
- Staging on `v2.mysassys.com`; family loads real menu/catalog data.
- Onboard 1–2 wholesale pilot customers on staging for a week.
- Snapshot WordPress content; archive to R2.
- Apex DNS cutover; CF Page Rules for legacy URL redirects.
- Monitor for 30 days; keep GoDaddy hosting live as rollback net.

**Rough total: ~5–6 weeks of focused build.**

---

## Verification plan

- **Local dev**: `pnpm dev` runs Next.js on Neon (dev branch); `wrangler pages dev` for CF-runtime parity checks before deploying.
- **Type + lint gates**: `pnpm typecheck && pnpm lint && pnpm drizzle-kit check` in CI on every PR.
- **Unit / integration**: Vitest for lib code (Clover client, rate limiter, auth passcode flow). Playwright for critical paths — retail happy path (browse → cart → Clover redirect → return), wholesale happy path (login → reorder-last → submit), admin CRUD.
- **Clover integration**: use Clover **Sandbox merchant** for end-to-end tests. Simulate webhook signature and idempotency (replay a webhook twice, assert single order row).
- **Accessibility**: `@axe-core/playwright` runs against public pages + wholesale portal + admin — CI fails on serious/critical violations.
- **Load reality check**: k6 script hitting `/api/orders/retail/queue` at 5s intervals for a simulated 2-baker shift, plus 200 retail order submits in a 2-hour window — confirms comfortable margin under free-tier limits.
- **Manual pre-launch checklist**: place a real retail order (small $) via Hosted Checkout → confirm POS ticket prints → confirm baker dashboard surfaces it → mark ready → confirm customer receives web push + email. Repeat for pay-at-store path. Repeat for wholesale (pilot customer places order → wholesale baker sees it in nightly view → email confirmations land).
- **Cutover verification**: after DNS flip, use `curl -I` + browser to confirm apex + `www` + legacy URLs (`/our-menu/`) all route correctly; monitor Sentry + UptimeRobot for the first 24h.
