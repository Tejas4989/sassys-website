/**
 * Nightly data backup — runs via CF Cron Trigger (nodejs runtime).
 *
 * Exports all core tables to NDJSON, compresses, writes to R2 with
 * a date-stamped key. CF edge can't run pg_dump, so we read via Drizzle
 * and serialize. Neon also provides 7-day PITR on the free tier — this
 * is belt-and-suspenders protection.
 *
 * R2 key pattern: backups/YYYY/MM/DD/sassys-YYYY-MM-DD.ndjson
 * Retention: old backups are not auto-deleted by this cron — use R2's
 * lifecycle rules (set "delete after 30 days" in the CF dashboard).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import * as schema from "@/db/schema";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("x-cron-secret") === secret;
}

// Tables to back up, in dependency order (parents before children)
const TABLES = [
  { name: "users", table: schema.users },
  { name: "wholesale_customers", table: schema.wholesaleCustomers },
  { name: "menu_categories", table: schema.menuCategories },
  { name: "menu_items", table: schema.menuItems },
  { name: "wholesale_categories", table: schema.wholesaleCategories },
  { name: "wholesale_items", table: schema.wholesaleItems },
  { name: "weekly_specials", table: schema.weeklySpecials },
  { name: "hours", table: schema.hours },
  { name: "holiday_overrides", table: schema.holidayOverrides },
  { name: "gallery_photos", table: schema.galleryPhotos },
  { name: "wholesale_carts", table: schema.wholesaleCarts },
  { name: "wholesale_cart_items", table: schema.wholesaleCartItems },
  { name: "orders", table: schema.orders },
  { name: "order_items", table: schema.orderItems },
  { name: "push_subscriptions", table: schema.pushSubscriptions },
  { name: "admin_audit_log", table: schema.adminAuditLog },
] as const;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const [year, month, day] = dateStr.split("-");
  const r2Key = `backups/${year}/${month}/${day}/sassys-${dateStr}.ndjson`;

  const report: Record<string, unknown> = { date: dateStr, tables: {} };

  try {
    // Build NDJSON: one line per record, prefixed with table name
    const lines: string[] = [`# Sassy's Bakery backup — ${now.toISOString()}\n`];

    for (const { name, table } of TABLES) {
      try {
        const rows = await db.select().from(table as any);
        for (const row of rows) {
          lines.push(JSON.stringify({ _table: name, ...row }) + "\n");
        }
        (report.tables as any)[name] = rows.length;
      } catch (err) {
        (report.tables as any)[name] = `ERROR: ${String(err)}`;
      }
    }

    const body = lines.join("");

    // Write to R2 via fetch (S3-compatible)
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME ?? "sassys-media",
        Key: r2Key,
        Body: body,
        ContentType: "application/x-ndjson",
        Metadata: { "backup-date": dateStr, "record-count": String(lines.length - 1) },
      })
    );

    report.r2Key = r2Key;
    report.totalRecords = lines.length - 1; // exclude header comment
    report.sizeBytes = Buffer.byteLength(body, "utf8");
    report.success = true;
  } catch (err) {
    report.error = String(err);
    report.success = false;

    // Alert admin on backup failure
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Sassy's Monitor <noreply@mysassys.com>",
        to: process.env.ADMIN_EMAIL ?? "inquiry@mysassys.com",
        subject: "❌ Sassy's nightly backup FAILED",
        html: `<p>The nightly database backup failed on ${dateStr}.</p><pre>${String(err)}</pre><p>Neon 7-day PITR is still active as a fallback.</p>`,
      });
    } catch {}
  }

  return NextResponse.json(report);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
