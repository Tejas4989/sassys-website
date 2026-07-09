/**
 * Tests for wholesale cart business logic:
 * - MOQ enforcement on add
 * - Price totaling
 * - Case-size rounding logic
 */

import { describe, it, expect } from "vitest";

interface CartItem {
  itemId: string;
  name: string;
  qty: number;
  moq: number;
  caseSize: number;
  wholesalePriceCents: number;
}

function enforceMinOrderQty(requestedQty: number, moq: number): number {
  if (requestedQty <= 0) return 0;
  return Math.max(requestedQty, moq);
}

function roundToCaseSize(qty: number, caseSize: number): number {
  if (caseSize <= 1) return qty;
  return Math.ceil(qty / caseSize) * caseSize;
}

function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.wholesalePriceCents * i.qty, 0);
}

describe("Wholesale cart — MOQ enforcement", () => {
  it("returns MOQ when requested qty is below MOQ", () => {
    expect(enforceMinOrderQty(1, 6)).toBe(6);
    expect(enforceMinOrderQty(3, 12)).toBe(12);
  });

  it("returns requested qty when above MOQ", () => {
    expect(enforceMinOrderQty(10, 6)).toBe(10);
    expect(enforceMinOrderQty(24, 12)).toBe(24);
  });

  it("returns 0 when qty is 0 (remove)", () => {
    expect(enforceMinOrderQty(0, 6)).toBe(0);
  });

  it("returns 0 when qty is negative (remove)", () => {
    expect(enforceMinOrderQty(-1, 6)).toBe(0);
  });
});

describe("Wholesale cart — case-size rounding", () => {
  it("rounds up to nearest case", () => {
    expect(roundToCaseSize(7, 6)).toBe(12);
    expect(roundToCaseSize(13, 12)).toBe(24);
  });

  it("does not round when qty is already a multiple of case size", () => {
    expect(roundToCaseSize(12, 6)).toBe(12);
    expect(roundToCaseSize(24, 12)).toBe(24);
  });

  it("is a no-op when case size is 1", () => {
    expect(roundToCaseSize(7, 1)).toBe(7);
    expect(roundToCaseSize(1, 1)).toBe(1);
  });
});

describe("Wholesale cart — price totaling", () => {
  it("totals correctly", () => {
    const items: CartItem[] = [
      { itemId: "a", name: "Sourdough", qty: 6, moq: 6, caseSize: 6, wholesalePriceCents: 350 },
      { itemId: "b", name: "Buns", qty: 12, moq: 12, caseSize: 12, wholesalePriceCents: 120 },
    ];
    // 6 * 350 + 12 * 120 = 2100 + 1440 = 3540
    expect(cartTotal(items)).toBe(3540);
  });

  it("returns 0 for empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("handles large quantities without overflow", () => {
    const items: CartItem[] = [
      { itemId: "a", name: "Item", qty: 1000, moq: 1, caseSize: 1, wholesalePriceCents: 9999 },
    ];
    expect(cartTotal(items)).toBe(9_999_000);
  });
});
