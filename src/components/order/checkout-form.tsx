"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, CreditCard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "./cart-context";

const schema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  pickupAt: z.string().min(1, "Pickup time is required"),
  paymentMethod: z.enum(["clover_hosted", "pay_in_store"]),
  isCateringExplicit: z.boolean(),
  notes: z.string().max(500).optional(),
});

interface Props {
  onCancel: () => void;
}

export function CheckoutForm({ onCancel }: Props) {
  const router = useRouter();
  const { items, totalCents, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"clover_hosted" | "pay_in_store">("clover_hosted");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tax = Math.round(totalCents * 0.13);
  const grandTotal = totalCents + tax;

  // Build minimum pickup time: now + 30min, rounded up to next 15min
  function getMinPickupTime() {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    const mins = d.getMinutes();
    const rounded = Math.ceil(mins / 15) * 15;
    d.setMinutes(rounded, 0, 0);
    return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const raw = {
      customerName: fd.get("customerName") as string,
      customerEmail: fd.get("customerEmail") as string,
      customerPhone: fd.get("customerPhone") as string || undefined,
      pickupAt: fd.get("pickupAt") as string,
      paymentMethod,
      isCateringExplicit: fd.get("isCatering") === "on",
      notes: fd.get("notes") as string || undefined,
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          pickupAt: new Date(parsed.data.pickupAt).toISOString(),
          fulfillment: "pickup",
          items: items.map((i) => ({ itemId: i.itemId, qty: i.qty })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      clear();

      if (data.isCatering) {
        router.push(`/order/confirmation?orderId=${data.orderId}&catering=1`);
      } else if (data.checkoutUrl) {
        // Redirect to Clover Hosted Checkout
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/order/confirmation?orderId=${data.orderId}`);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Contact info */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-base">Your Info</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="customerName">Name *</Label>
            <Input id="customerName" name="customerName" required placeholder="Jane Smith" />
            {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required placeholder="jane@example.com" />
            {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail}</p>}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="customerPhone">Phone (optional)</Label>
          <Input id="customerPhone" name="customerPhone" type="tel" placeholder="(519) 555-0100" />
        </div>
      </div>

      {/* Pickup time */}
      <div className="space-y-1">
        <Label htmlFor="pickupAt">Pickup Time *</Label>
        <Input
          id="pickupAt"
          name="pickupAt"
          type="datetime-local"
          min={getMinPickupTime()}
          required
        />
        {errors.pickupAt && <p className="text-xs text-destructive">{errors.pickupAt}</p>}
        <p className="text-xs text-muted-foreground">Minimum 30 minutes from now.</p>
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("clover_hosted")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-colors ${paymentMethod === "clover_hosted" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
          >
            <CreditCard className="w-5 h-5" />
            Pay Online
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("pay_in_store")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-colors ${paymentMethod === "pay_in_store" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
          >
            <Store className="w-5 h-5" />
            Pay at Store
          </button>
        </div>
      </div>

      {/* Notes + catering checkbox */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isCatering" name="isCatering" className="rounded" />
          <Label htmlFor="isCatering" className="text-sm font-normal cursor-pointer">
            This is a catering order (requires employee review before confirmation)
          </Label>
        </div>
        <div className="space-y-1">
          <Label htmlFor="notes">Special Instructions</Label>
          <Textarea id="notes" name="notes" placeholder="Allergies, special requests..." rows={2} maxLength={500} />
        </div>
      </div>

      {/* Order summary */}
      <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/30">
        <h4 className="font-semibold text-sm">Order Summary</h4>
        {items.map((i) => (
          <div key={i.itemId} className="flex justify-between text-xs text-muted-foreground">
            <span>{i.qty}× {i.name}</span>
            <span>${((i.priceCents * i.qty) / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>${(totalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>HST (13%)</span>
            <span>${(tax / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>${(grandTotal / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Back to Menu
        </Button>
        <Button type="submit" className="flex-1" disabled={loading || items.length === 0}>
          {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
          {paymentMethod === "clover_hosted" ? "Pay Now" : "Place Order"}
        </Button>
      </div>
    </form>
  );
}
