import { Resend } from "resend";

// Instantiate lazily so importing this module at build time (page-data
// collection) doesn't require RESEND_API_KEY — the key only exists at runtime.
let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = "Sassy's Bakery <noreply@mysassys.com>";

export async function sendOrderConfirmation(opts: {
  to: string;
  name: string;
  orderId: string;
  items: Array<{ name: string; qty: number; priceCents: number }>;
  totalCents: number;
  fulfillment: "pickup" | "delivery";
  pickupAt?: Date | null;
  deliveryDate?: string | null;
}) {
  const itemsHtml = opts.items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${(i.priceCents / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  const timing =
    opts.fulfillment === "pickup" && opts.pickupAt
      ? `Pickup at: ${opts.pickupAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}`
      : opts.deliveryDate
        ? `Delivery date: ${opts.deliveryDate}`
        : "";

  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Sassy's Order Confirmation #${opts.orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <h2>Thanks, ${opts.name}! Your order is confirmed.</h2>
      <p>${timing}</p>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total: $${(opts.totalCents / 100).toFixed(2)}</strong></p>
      <p>Questions? Call us at (519) 461-1234 or email inquiry@mysassys.com</p>
    `,
  });
}

export async function sendOrderReady(opts: {
  to: string;
  name: string;
  orderId: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your Sassy's order is ready! 🎉`,
    html: `
      <h2>Your order is ready for pickup!</h2>
      <p>Hi ${opts.name}, your order #${opts.orderId.slice(0, 8).toUpperCase()} is ready.</p>
      <p>See you soon! — Sassy's Bakery, 225 King St, Thorndale ON</p>
    `,
  });
}

export async function sendWholesaleWelcome(opts: {
  to: string;
  name: string;
  businessName: string;
  passcode: string;
  loginUrl: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Welcome to Sassy's Wholesale Portal — ${opts.businessName}`,
    html: `
      <h2>Welcome to Sassy's Wholesale Portal!</h2>
      <p>Hi ${opts.name},</p>
      <p>Your wholesale account for <strong>${opts.businessName}</strong> is ready.</p>
      <p><strong>Login at:</strong> <a href="${opts.loginUrl}">${opts.loginUrl}</a></p>
      <p><strong>Your email:</strong> ${opts.to}</p>
      <p><strong>Your temporary passcode:</strong> <code>${opts.passcode}</code></p>
      <p>You'll be asked to set your own passcode on first login.</p>
      <p>Questions? Call (519) 461-1234.</p>
    `,
  });
}

export async function sendWholesaleOrderConfirmation(opts: {
  to: string;
  name: string;
  businessName: string;
  orderId: string;
  items: Array<{ name: string; qty: number }>;
  fulfillment: "pickup" | "delivery";
  deliveryDate?: string | null;
  pickupAt?: Date | null;
  notes?: string | null;
}) {
  const itemsHtml = opts.items
    .map((i) => `<li>${i.qty}× ${i.name}</li>`)
    .join("");

  const timing =
    opts.fulfillment === "delivery" && opts.deliveryDate
      ? `Delivery date: ${opts.deliveryDate}`
      : opts.pickupAt
        ? `Pickup at: ${opts.pickupAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}`
        : "";

  await getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Wholesale Order Received — ${opts.businessName}`,
    html: `
      <h2>Order received — thank you!</h2>
      <p>${timing}</p>
      <ul>${itemsHtml}</ul>
      ${opts.notes ? `<p><em>Notes: ${opts.notes}</em></p>` : ""}
      <p>Order reference: #${opts.orderId.slice(0, 8).toUpperCase()}</p>
      <p>Questions? Call (519) 461-1234.</p>
    `,
  });
}

export async function sendContactMessage(opts: {
  name: string;
  email: string;
  message: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL ?? "inquiry@mysassys.com",
    replyTo: opts.email,
    subject: `New contact message from ${opts.name}`,
    html: `
      <h2>New message via mysassys.com</h2>
      <p><strong>From:</strong> ${opts.name} (${opts.email})</p>
      <p style="white-space:pre-wrap">${opts.message}</p>
    `,
  });
}

export async function sendAdminCateringAlert(opts: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  pickupAt?: Date | null;
  notes?: string | null;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";
  await getResend().emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL ?? "inquiry@mysassys.com",
    subject: `⚠️ Catering order needs review — $${(opts.totalCents / 100).toFixed(2)}`,
    html: `
      <h2>Catering Order Pending Review</h2>
      <p><strong>Customer:</strong> ${opts.customerName} (${opts.customerEmail})</p>
      <p><strong>Total:</strong> $${(opts.totalCents / 100).toFixed(2)}</p>
      ${opts.pickupAt ? `<p><strong>Pickup:</strong> ${opts.pickupAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}</p>` : ""}
      ${opts.notes ? `<p><strong>Notes:</strong> ${opts.notes}</p>` : ""}
      <p><a href="${appUrl}/admin/review-queue/${opts.orderId}">Review this order</a></p>
    `,
  });
}
