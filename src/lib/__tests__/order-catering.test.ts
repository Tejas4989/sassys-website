/**
 * Tests for catering order detection logic.
 * Catering flag is set when:
 *   1. Total >= $200 (20000 cents)
 *   2. Pickup >= 48 hours from now
 *   3. Customer explicitly ticks the catering checkbox
 */

import { describe, it, expect } from "vitest";

const CATERING_THRESHOLD_CENTS = 20_000;
const CATERING_ADVANCE_HOURS = 48;

function isCatering(opts: {
  totalCents: number;
  pickupAt: Date | null;
  isCateringExplicit: boolean;
}): boolean {
  const hoursUntilPickup = opts.pickupAt
    ? (opts.pickupAt.getTime() - Date.now()) / (1000 * 60 * 60)
    : 0;

  return (
    opts.isCateringExplicit ||
    opts.totalCents >= CATERING_THRESHOLD_CENTS ||
    hoursUntilPickup >= CATERING_ADVANCE_HOURS
  );
}

describe("Catering detection", () => {
  it("flags explicit catering regardless of total or time", () => {
    expect(
      isCatering({ totalCents: 500, pickupAt: null, isCateringExplicit: true })
    ).toBe(true);
  });

  it("flags orders >= $200", () => {
    expect(
      isCatering({ totalCents: 20_000, pickupAt: null, isCateringExplicit: false })
    ).toBe(true);

    expect(
      isCatering({ totalCents: 25_000, pickupAt: null, isCateringExplicit: false })
    ).toBe(true);
  });

  it("does not flag orders < $200", () => {
    expect(
      isCatering({ totalCents: 19_999, pickupAt: null, isCateringExplicit: false })
    ).toBe(false);
  });

  it("flags pickup >= 48h from now", () => {
    const in49Hours = new Date(Date.now() + 49 * 60 * 60 * 1000);
    expect(
      isCatering({ totalCents: 500, pickupAt: in49Hours, isCateringExplicit: false })
    ).toBe(true);
  });

  it("does not flag pickup < 48h from now", () => {
    const in1Hour = new Date(Date.now() + 60 * 60 * 1000);
    expect(
      isCatering({ totalCents: 500, pickupAt: in1Hour, isCateringExplicit: false })
    ).toBe(false);
  });

  it("null pickup time is not treated as advance booking", () => {
    expect(
      isCatering({ totalCents: 500, pickupAt: null, isCateringExplicit: false })
    ).toBe(false);
  });

  it("OR logic — any condition triggers catering", () => {
    // None of the conditions
    expect(isCatering({ totalCents: 100, pickupAt: new Date(Date.now() + 3600_000), isCateringExplicit: false })).toBe(false);
    // Only explicit
    expect(isCatering({ totalCents: 100, pickupAt: new Date(Date.now() + 3600_000), isCateringExplicit: true })).toBe(true);
    // Only total
    expect(isCatering({ totalCents: 20_001, pickupAt: new Date(Date.now() + 3600_000), isCateringExplicit: false })).toBe(true);
    // Only advance pickup
    expect(isCatering({ totalCents: 100, pickupAt: new Date(Date.now() + 50 * 3600_000), isCateringExplicit: false })).toBe(true);
  });
});
