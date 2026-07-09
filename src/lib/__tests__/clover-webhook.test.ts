/**
 * Tests for Clover webhook signature verification.
 * Uses the Web Crypto API (available in Node 18+ and CF Workers).
 */

import { describe, it, expect } from "vitest";

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signPayload(payload, secret);
  return expected === signature;
}

describe("Clover webhook HMAC verification", () => {
  const SECRET = "test-webhook-secret-abc123";
  const PAYLOAD = JSON.stringify({ type: "payment.created", data: { object: { id: "order-1" } } });

  it("accepts a valid signature", async () => {
    const sig = await signPayload(PAYLOAD, SECRET);
    expect(await verifySignature(PAYLOAD, sig, SECRET)).toBe(true);
  });

  it("rejects a tampered payload", async () => {
    const sig = await signPayload(PAYLOAD, SECRET);
    const tampered = PAYLOAD.replace("order-1", "order-2");
    expect(await verifySignature(tampered, sig, SECRET)).toBe(false);
  });

  it("rejects a wrong secret", async () => {
    const sig = await signPayload(PAYLOAD, SECRET);
    expect(await verifySignature(PAYLOAD, sig, "wrong-secret")).toBe(false);
  });

  it("rejects an empty signature", async () => {
    expect(await verifySignature(PAYLOAD, "", SECRET)).toBe(false);
  });

  it("is idempotent — same payload and secret always produce same signature", async () => {
    const sig1 = await signPayload(PAYLOAD, SECRET);
    const sig2 = await signPayload(PAYLOAD, SECRET);
    expect(sig1).toBe(sig2);
  });
});
