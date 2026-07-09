import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, orderItems, menuItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createCloverOrder } from "@/lib/clover";
import { sendOrderConfirmation, sendAdminCateringAlert } from "@/lib/email";

export const runtime = "edge";

const CATERING_THRESHOLD_CENTS = 20000; // $200
const CATERING_ADVANCE_HOURS = 48;

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      qty: z.number().int().min(1),
    })
  ).min(1),
  fulfillment: z.enum(["pickup", "delivery"]),
  pickupAt: z.string().datetime().optional(), // ISO string
  paymentMethod: z.enum(["clover_hosted", "pay_in_store"]),
  isCateringExplicit: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const itemIds = data.items.map((i) => i.itemId);

  // Fetch current prices from DB — never trust client-submitted prices
  const dbItems = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, itemIds));

  if (dbItems.length !== itemIds.length) {
    return NextResponse.json(
      { error: "One or more items not found or inactive" },
      { status: 400 }
    );
  }

  const itemMap = Object.fromEntries(dbItems.map((i) => [i.id, i]));
  const lineItems = data.items.map((li) => {
    const item = itemMap[li.itemId];
    return {
      name: item.name,
      price: item.priceCents,
      quantity: li.qty,
    };
  });

  const subtotalCents = lineItems.reduce(
    (sum, li) => sum + li.price * li.quantity,
    0
  );
  const taxCents = Math.round(subtotalCents * 0.13); // Ontario HST 13%
  const totalCents = subtotalCents + taxCents;

  // Determine if this is a catering order
  const pickupDate = data.pickupAt ? new Date(data.pickupAt) : null;
  const hoursUntilPickup = pickupDate
    ? (pickupDate.getTime() - Date.now()) / (1000 * 60 * 60)
    : 0;
  const isCatering =
    data.isCateringExplicit ||
    totalCents >= CATERING_THRESHOLD_CENTS ||
    hoursUntilPickup >= CATERING_ADVANCE_HOURS;

  const status = isCatering ? "pending_review" : "pending";

  // Create order row
  const [order] = await db
    .insert(orders)
    .values({
      type: "retail",
      status,
      fulfillment: data.fulfillment,
      paymentMethod: data.paymentMethod,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pickupAt: pickupDate,
      subtotalCents,
      taxCents,
      totalCents,
      isCatering,
      notes: data.notes,
    })
    .returning();

  // Insert order items (denormalized)
  await db.insert(orderItems).values(
    data.items.map((li) => ({
      orderId: order.id,
      itemId: li.itemId,
      name: itemMap[li.itemId].name,
      priceCents: itemMap[li.itemId].priceCents,
      qty: li.qty,
    }))
  );

  let checkoutUrl: string | undefined;

  if (!isCatering && data.paymentMethod === "clover_hosted") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";
    const result = await createCloverOrder({
      lineItems,
      note: `Order ${order.id.slice(0, 8)} — ${data.customerName}`,
      hostedCheckout: true,
      returnUrl: `${appUrl}/order/confirmation?orderId=${order.id}`,
    });

    await db
      .update(orders)
      .set({ cloverOrderId: result.cloverOrderId })
      .where(eq(orders.id, order.id));

    checkoutUrl = result.checkoutUrl;
  } else if (!isCatering && data.paymentMethod === "pay_in_store") {
    // Push order to Clover POS so it prints on the kitchen ticket
    const result = await createCloverOrder({
      lineItems,
      note: `PAY AT STORE — Order ${order.id.slice(0, 8)} — ${data.customerName}`,
      hostedCheckout: false,
    });

    await db
      .update(orders)
      .set({
        cloverOrderId: result.cloverOrderId,
        status: "confirmed",
      })
      .where(eq(orders.id, order.id));

    // Send confirmation immediately for pay-at-store
    sendOrderConfirmation({
      to: data.customerEmail,
      name: data.customerName,
      orderId: order.id,
      items: lineItems.map((li) => ({
        name: li.name,
        qty: li.quantity,
        priceCents: li.price,
      })),
      totalCents,
      fulfillment: data.fulfillment,
      pickupAt: pickupDate,
    }).catch(console.error);
  } else if (isCatering) {
    sendAdminCateringAlert({
      orderId: order.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      totalCents,
      pickupAt: pickupDate,
      notes: data.notes,
    }).catch(console.error);
  }

  return NextResponse.json({
    orderId: order.id,
    isCatering,
    checkoutUrl,
  });
}
