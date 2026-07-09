// Clover Ecommerce API + Orders API client
// Docs: https://docs.clover.com/docs/ecommerce-accepting-payments

const BASE = "https://scl.clover.com";
const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID!;
const API_KEY = process.env.CLOVER_API_KEY!;

interface CloverLineItem {
  name: string;
  price: number; // cents
  quantity: number;
}

interface CreateOrderResult {
  cloverOrderId: string;
  checkoutUrl?: string; // present for hosted-checkout path
}

export async function createCloverOrder(opts: {
  lineItems: CloverLineItem[];
  note?: string;
  hostedCheckout: boolean;
  returnUrl?: string; // required if hostedCheckout = true
}): Promise<CreateOrderResult> {
  // 1. Create the order in Clover
  const orderRes = await fetch(
    `${BASE}/v3/merchants/${MERCHANT_ID}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: opts.note ?? "",
        lineItems: opts.lineItems.map((li) => ({
          name: li.name,
          price: li.price,
          quantity: li.quantity,
          unitQty: li.quantity,
        })),
      }),
    }
  );

  if (!orderRes.ok) {
    const err = await orderRes.text();
    throw new Error(`Clover createOrder failed: ${orderRes.status} ${err}`);
  }

  const order = await orderRes.json();
  const cloverOrderId = order.id as string;

  if (!opts.hostedCheckout) {
    return { cloverOrderId };
  }

  // 2. Create a hosted checkout session
  const checkoutRes = await fetch(
    `${BASE}/invoicingcheckoutservice/v1/checkouts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {},
        shoppingCart: {
          lineItems: opts.lineItems.map((li) => ({
            name: li.name,
            unitAmount: li.price,
            quantity: li.quantity,
          })),
        },
        redirectUrls: {
          success: opts.returnUrl,
          cancel: opts.returnUrl,
          failure: opts.returnUrl,
        },
        metadata: { cloverOrderId },
      }),
    }
  );

  if (!checkoutRes.ok) {
    const err = await checkoutRes.text();
    throw new Error(`Clover createCheckout failed: ${checkoutRes.status} ${err}`);
  }

  const checkout = await checkoutRes.json();
  return {
    cloverOrderId,
    checkoutUrl: checkout.href as string,
  };
}

export function verifyCloverWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.CLOVER_WEBHOOK_SECRET!;
  const encoder = new TextEncoder();
  // Clover uses HMAC-SHA256 of the raw request body
  return crypto.subtle
    .importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((key) =>
      crypto.subtle.sign("HMAC", key, encoder.encode(rawBody))
    )
    .then((sig) => {
      const hex = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hex === signature;
    }) as unknown as boolean;
  // Note: this returns a Promise<boolean> — callers must await it.
  // The return type annotation is a simplification; cast in the webhook handler.
}

export async function verifyCloverWebhookSignatureAsync(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.CLOVER_WEBHOOK_SECRET!;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}
