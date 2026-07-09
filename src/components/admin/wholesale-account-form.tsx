"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface Account {
  businessName: string;
  name: string;
  email: string;
  contactPhone?: string | null;
  address?: string | null;
  defaultFulfillment: string;
  defaultDeliveryDay?: string | null;
  notes?: string | null;
}

interface Props {
  account?: Account;
  customerId?: string;
  action: (fd: FormData) => Promise<void>;
}

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export function WholesaleAccountForm({ account, customerId, action }: Props) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input id="businessName" name="businessName" required defaultValue={account?.businessName} placeholder="Corner Convenience" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Contact Person *</Label>
          <Input id="name" name="name" required defaultValue={account?.name} placeholder="Jane Smith" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required defaultValue={account?.email} placeholder="jane@business.com" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone">Phone</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={account?.contactPhone ?? ""} placeholder="(519) 555-0100" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="defaultFulfillment">Default Fulfillment</Label>
          <Select name="defaultFulfillment" defaultValue={account?.defaultFulfillment ?? "pickup"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="defaultDeliveryDay">Default Delivery Day</Label>
        <Select name="defaultDeliveryDay" defaultValue={account?.defaultDeliveryDay ?? ""}>
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {DAYS.map((d) => (
              <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={account?.address ?? ""} placeholder="123 Main St, London, ON" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={account?.notes ?? ""} rows={2} placeholder="Delivery notes, preferences…" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">{account ? "Save Changes" : "Create Account"}</Button>
        <Button asChild variant="outline"><Link href="/admin/accounts">Cancel</Link></Button>
      </div>
    </form>
  );
}
