import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getWholesaleCart,
  getWholesaleCustomerByUserId,
} from "@/lib/data/wholesale";
import { submitWholesaleOrder } from "@/lib/actions/wholesale-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function WholesaleCheckoutPage() {
  const session = await auth();
  const customerRow = await getWholesaleCustomerByUserId(session!.user.id!);
  const customerId = customerRow!.customer.id;

  const cart = await getWholesaleCart(customerId);

  if (cart.items.length === 0) redirect("/wholesale");

  const totalCents = cart.items.reduce(
    (sum, i) => sum + i.wholesalePriceCents * i.qty,
    0
  );
  const defaultFulfillment = customerRow!.customer.defaultFulfillment ?? "pickup";

  // Min delivery date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/wholesale"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Submit Order</h1>
      </div>

      {/* Order summary */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-sm mb-3">Order Summary</h2>
          {cart.items.map((i) => (
            <div key={i.cartItemId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{i.qty}× {i.name}</span>
              <span>${((i.wholesalePriceCents * i.qty) / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${(totalCents / 100).toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Invoiced net-30. No payment required now.</p>
        </CardContent>
      </Card>

      <form action={submitWholesaleOrder} className="space-y-5">
        {/* Fulfillment */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Fulfillment</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 ${defaultFulfillment === "pickup" ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="radio" name="fulfillment" value="pickup" defaultChecked={defaultFulfillment === "pickup"} className="accent-primary" />
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Pickup</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 ${defaultFulfillment === "delivery" ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="radio" name="fulfillment" value="delivery" defaultChecked={defaultFulfillment === "delivery"} className="accent-primary" />
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium">Delivery</span>
            </label>
          </div>
        </fieldset>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="deliveryDate">
            Delivery / Pickup Date *
          </Label>
          <Input
            id="deliveryDate"
            name="deliveryDate"
            type="date"
            min={minDate}
            defaultValue={minDate}
            required
          />
          <p className="text-xs text-muted-foreground">
            Orders placed by end of day are fulfilled the next business day.
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Special instructions, delivery notes, item substitutions…"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Submit Order
          </Button>
          <Button asChild variant="outline">
            <Link href="/wholesale">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
