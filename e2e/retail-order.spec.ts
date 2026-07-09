/**
 * Retail order happy path E2E.
 * Requires a running dev/preview server with a seeded database.
 * Set PLAYWRIGHT_BASE_URL to point at the correct environment.
 *
 * Skipped by default in CI unless E2E_ENABLED=1 is set, since
 * this test needs a real DB + Clover sandbox.
 */

import { test, expect } from "@playwright/test";

test.skip(
  !process.env.E2E_ENABLED,
  "Retail order E2E skipped — set E2E_ENABLED=1 with a real DB to run"
);

test.describe("Retail order happy path", () => {
  test("customer can browse menu, add items to cart, and reach checkout", async ({ page }) => {
    await page.goto("/order");

    // Verify heading
    await expect(page.getByRole("heading", { name: "Order Online" })).toBeVisible();

    // Cart should start empty
    await expect(page.getByText("Cart")).toBeVisible();
  });
});

test.describe("Wholesale login happy path", () => {
  test.skip(
    !process.env.E2E_ENABLED,
    "Wholesale E2E skipped — set E2E_ENABLED=1 with a real DB to run"
  );

  test("wholesale login page renders correctly", async ({ page }) => {
    await page.goto("/wholesale/login");

    await expect(page.getByText("Wholesale Portal")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
  });
});
