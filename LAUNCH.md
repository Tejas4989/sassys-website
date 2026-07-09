# Sassy's Bakery — Launch Checklist

## Before you start

- [ ] Neon database created, `DATABASE_URL` obtained
- [ ] Drizzle migrations run: `pnpm db:migrate`
- [ ] Cloudflare account set up, `wrangler login` completed
- [ ] R2 bucket `sassys-media` created in Cloudflare dashboard
  - Set lifecycle rule: delete objects in `backups/` after 30 days
  - Enable public access for the `menu/`, `gallery/`, `catalog/` prefixes (or use a custom domain)
- [ ] Resend account created, domain `mysassys.com` verified, API key obtained
- [ ] Clover sandbox merchant created for testing

---

## Secrets — set these before deploying

Run each:

```bash
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET         # openssl rand -base64 32
wrangler secret put RESEND_API_KEY
wrangler secret put ADMIN_EMAIL         # inquiry@mysassys.com
wrangler secret put CLOVER_MERCHANT_ID
wrangler secret put CLOVER_API_KEY
wrangler secret put CLOVER_WEBHOOK_SECRET
wrangler secret put CRON_SECRET         # openssl rand -base64 32

# Generate VAPID keys first:
pnpm generate:vapid
# Then set:
wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
wrangler secret put NEXT_PUBLIC_VAPID_PUBLIC_KEY   # same as VAPID_PUBLIC_KEY

# R2 credentials (create an R2 API token in CF dashboard)
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

For Sentry (optional):
```bash
wrangler secret put NEXT_PUBLIC_SENTRY_DSN
```

---

## Content setup (before launch)

- [ ] Log into `/admin` (create first admin user directly in Neon console or via Drizzle Studio: `pnpm db:studio`)
- [ ] Add menu categories and items in `/admin/menu`
- [ ] Set regular hours in `/admin/hours`
- [ ] Add gallery photos in `/admin/gallery`
- [ ] Add wholesale categories and catalog items in `/admin/catalog`

---

## Staging deployment

```bash
# Build for Cloudflare
pnpm build:cf

# Deploy to staging (v2.mysassys.com)
pnpm deploy:staging
```

- [ ] Browse v2.mysassys.com — check home page, menu, gallery, contact
- [ ] Place a test retail order (pay at store path first, then Clover sandbox)
- [ ] Test retail baker dashboard at `/baker/retail` — confirm polling works, "mark ready" sends email
- [ ] Create a test wholesale account in `/admin/accounts/new`
- [ ] Log in as that wholesale customer — test add-to-cart, checkout, order history
- [ ] Test wholesale baker dashboard at `/baker/wholesale`
- [ ] Check `/admin/review-queue` with a catering order
- [ ] Verify accessibility: `pnpm exec playwright test e2e/accessibility.spec.ts`
- [ ] Verify unit tests: `pnpm test`

---

## WordPress snapshot (do this before DNS cutover)

```bash
node scripts/snapshot-wordpress.mjs
# Creates ./wordpress-snapshot/YYYY-MM-DD/
```

---

## DNS cutover

1. In GoDaddy, update nameservers to Cloudflare (from Cloudflare dashboard → your domain → nameservers)
2. Wait for DNS propagation (up to 48hr; usually <2hr)
3. In Cloudflare dashboard:
   - Add CNAME: `mysassys.com` → Cloudflare Pages project (or A record if Pages uses IP)
   - Add CNAME: `www` → `mysassys.com`
   - Add CNAME: `v2` → Cloudflare Pages staging project
   - Add CNAME: `media` → R2 public bucket (for `media.mysassys.com`)
4. Add CF Page Rules for any remaining legacy URL patterns not in `next.config.ts`
5. Production deploy:

```bash
pnpm deploy
```

6. Verify:

```bash
curl -I https://mysassys.com
curl -I https://mysassys.com/our-menu/   # Should 308 → /menu
curl -I https://www.mysassys.com/         # Should redirect to apex
```

---

## Post-cutover (first 30 days)

- [ ] Set up UptimeRobot free account → monitor `https://mysassys.com`, `https://mysassys.com/api/health`, `https://mysassys.com/wholesale/login` (5-min interval, email + SMS on down)
- [ ] Verify cron jobs fire (check `/api/cron/monitor` at 07:00 UTC next day)
- [ ] Check backup was created in R2 `backups/` folder next morning
- [ ] Monitor Sentry for any JS/server errors
- [ ] Keep GoDaddy hosting live for 30 days as rollback net, then cancel

---

## Clover production setup

1. Switch `CLOVER_API_KEY` and `CLOVER_MERCHANT_ID` from sandbox to production in `wrangler secret put`
2. Register the production webhook URL: `https://mysassys.com/api/webhooks/clover`
   - Events: `payment.created`, `payment.updated`
3. Update `CLOVER_WEBHOOK_SECRET` to the production webhook secret

---

## Onboarding wholesale customers

For each wholesale account:
1. Go to `/admin/accounts/new`
2. Fill in business name, contact name, email, default fulfillment, delivery day
3. Click "Create Account" — system generates a 6-digit passcode
4. **Copy the passcode immediately** (shown only once)
5. Call or email the customer with their login URL and passcode:
   > "Hi [Name], your Sassy's wholesale account is ready. Log in at mysassys.com/wholesale/login with your email and this passcode: XXXXXX. You'll be asked to set your own passcode on first login."
6. Suggest they bookmark the login page and add the site to their home screen (PWA)
