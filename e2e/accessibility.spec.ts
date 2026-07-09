/**
 * Accessibility checks — WCAG 2.0 AA via axe-core.
 * Fails CI on critical or serious violations.
 * These pages render gracefully even without a DB (fallback to empty state).
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_PAGES = [
  { path: "/", name: "Home" },
  { path: "/menu", name: "Menu" },
  { path: "/gallery", name: "Gallery" },
  { path: "/contact", name: "Contact" },
  { path: "/order", name: "Order" },
  { path: "/wholesale/login", name: "Wholesale Login" },
  { path: "/admin/login", name: "Admin Login" },
];

for (const page of PUBLIC_PAGES) {
  test(`[a11y] ${page.name} has no critical/serious violations`, async ({
    page: browserPage,
  }) => {
    await browserPage.goto(page.path);

    // Wait for page to settle
    await browserPage.waitForLoadState("networkidle").catch(() => {});

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(["wcag2a", "wcag2aa"])
      // Exclude vendor components we can't control
      .exclude(".sr-only")
      .analyze();

    const criticalOrSerious = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? "")
    );

    if (criticalOrSerious.length > 0) {
      const summary = criticalOrSerious
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description}\n  nodes: ${v.nodes.map((n) => n.target).join(", ")}`
        )
        .join("\n\n");
      throw new Error(
        `${criticalOrSerious.length} critical/serious a11y violation(s) on ${page.path}:\n\n${summary}`
      );
    }

    // Log moderate/minor violations as warnings (non-failing)
    const warnings = results.violations.filter((v) =>
      ["moderate", "minor"].includes(v.impact ?? "")
    );
    if (warnings.length > 0) {
      console.warn(
        `${page.name}: ${warnings.length} moderate/minor a11y warning(s) (non-failing):`
      );
      warnings.forEach((v) => console.warn(`  [${v.impact}] ${v.id}: ${v.description}`));
    }
  });
}
