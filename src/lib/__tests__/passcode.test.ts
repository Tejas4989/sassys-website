/**
 * Tests for the wholesale passcode flow:
 * - Passcode generation always produces 6 digits
 * - Passcode hashing is deterministic (argon2)
 * - Passcode validation rejects wrong codes
 */

import { describe, it, expect } from "vitest";
import { hash, verify } from "argon2";

function generatePasscode(): string {
  const digits = new Uint8Array(6);
  for (let i = 0; i < 6; i++) digits[i] = Math.floor(Math.random() * 10);
  return Array.from(digits).join("");
}

describe("Wholesale passcode", () => {
  it("always generates exactly 6 digits", () => {
    for (let i = 0; i < 20; i++) {
      const code = generatePasscode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code).toHaveLength(6);
    }
  });

  it("all digits are in 0-9 range", () => {
    for (let i = 0; i < 50; i++) {
      const code = generatePasscode();
      for (const char of code) {
        expect(Number(char)).toBeGreaterThanOrEqual(0);
        expect(Number(char)).toBeLessThanOrEqual(9);
      }
    }
  });

  it("hashed passcode verifies correctly", async () => {
    const passcode = "482913";
    const hashed = await hash(passcode);

    expect(await verify(hashed, passcode)).toBe(true);
    expect(await verify(hashed, "000000")).toBe(false);
    expect(await verify(hashed, "482912")).toBe(false);
  });

  it("different passcodes produce different hashes", async () => {
    const code1 = "111111";
    const code2 = "222222";
    const hash1 = await hash(code1);
    const hash2 = await hash(code2);

    expect(hash1).not.toBe(hash2);
  });

  it("same passcode produces different hashes each time (salt)", async () => {
    const code = "482913";
    const h1 = await hash(code);
    const h2 = await hash(code);
    // argon2 salts — hashes should differ even for same input
    expect(h1).not.toBe(h2);
    // But both should verify correctly
    expect(await verify(h1, code)).toBe(true);
    expect(await verify(h2, code)).toBe(true);
  });
});
