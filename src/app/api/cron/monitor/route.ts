/**
 * Free-tier monitoring cron — runs nightly via CF Cron Trigger.
 * Checks usage of Neon (compute hours) and alerts admin when any
 * resource exceeds 70% of its free-tier monthly cap.
 *
 * Cloudflare free tier thresholds to track:
 *   - Neon: 190 compute-hours/month, 512 MB storage
 *   - Resend: 3,000 emails/month, 100/day
 *   - CF Workers: 100,000 requests/day (CF analytics only)
 *   - R2: 10 GB storage, 1M Class A ops/month
 *
 * Neon exposes compute hours via their management API.
 * We can't easily query CF/Resend usage from code, so we track
 * what we can and log the rest for manual review.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, pushSubscriptions, loginAttempts } from "@/db/schema";
import { sql, count, gte } from "drizzle-orm";

export const runtime = "nodejs";

// Cron secret prevents unauthorized triggers (set in CF Worker secrets)
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: no secret set, allow
  return req.headers.get("x-cron-secret") === secret;
}

async function sendMonitorAlert(issues: string[]) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "inquiry@mysassys.com";
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Sassy's Monitor <noreply@mysassys.com>",
    to: adminEmail,
    subject: `⚠️ Sassy's: Free-tier usage alert (${issues.length} issue${issues.length !== 1 ? "s" : ""})`,
    html: `
      <h2>Free-tier usage alert</h2>
      <ul>${issues.map((i) => `<li>${i}</li>`).join("")}</ul>
      <p>Check your dashboards and consider upgrading affected services before hitting limits.</p>
      <p><small>Sent by Sassy's nightly monitor cron.</small></p>
    `,
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issues: string[] = [];
  const report: Record<string, unknown> = {};

  try {
    // ─── Application-level metrics (from our own DB) ──────────────────────

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [ordersThisMonth, pushSubs, loginAttemptsToday] = await Promise.all([
      db.select({ cnt: count() }).from(orders).where(gte(orders.createdAt, monthStart)),
      db.select({ cnt: count() }).from(pushSubscriptions),
      db.select({ cnt: count() }).from(loginAttempts).where(gte(loginAttempts.attemptedAt, dayStart)),
    ]);

    report.ordersThisMonth = ordersThisMonth[0]?.cnt ?? 0;
    report.activePushSubscriptions = pushSubs[0]?.cnt ?? 0;
    report.loginAttemptsToday = loginAttemptsToday[0]?.cnt ?? 0;

    // Rough email estimate: ~3 emails per order (placed, ready, confirmation)
    const estimatedEmailsThisMonth = (ordersThisMonth[0]?.cnt ?? 0) * 3;
    report.estimatedEmailsThisMonth = estimatedEmailsThisMonth;

    const RESEND_MONTHLY_FREE = 3000;
    const RESEND_ALERT_THRESHOLD = RESEND_MONTHLY_FREE * 0.7;

    if (estimatedEmailsThisMonth > RESEND_ALERT_THRESHOLD) {
      issues.push(
        `Resend: estimated ~${estimatedEmailsThisMonth} emails this month (70% threshold: ${RESEND_ALERT_THRESHOLD}). Free tier: ${RESEND_MONTHLY_FREE}/month.`
      );
    }

    // Login attempts spike check — possible brute force
    if ((loginAttemptsToday[0]?.cnt ?? 0) > 500) {
      issues.push(
        `Login: ${loginAttemptsToday[0]?.cnt} attempts today — possible brute force. Check admin_audit_log.`
      );
    }

    // ─── Neon usage via management API ────────────────────────────────────
    // Neon doesn't have a simple usage endpoint on the free tier without
    // the API key from their management plane. We log a reminder instead.
    issues.push(
      "Manual check required: Review Neon dashboard for compute hours (free: 190 hrs/mo) and storage (free: 512 MB)."
    );

    report.checkedAt = now.toISOString();
    report.issuesFound = issues.length;

    // Send alert if any actionable issues (more than just the Neon reminder)
    if (issues.length > 1) {
      await sendMonitorAlert(issues);
      report.alertSent = true;
    } else {
      report.alertSent = false;
    }
  } catch (err) {
    report.error = String(err);
    // Still try to alert on error
    try {
      await sendMonitorAlert([`Monitor cron failed: ${String(err)}`]);
    } catch {}
  }

  return NextResponse.json(report);
}

// CF Cron Trigger fires this as a scheduled event
export async function POST(req: NextRequest) {
  return GET(req);
}
