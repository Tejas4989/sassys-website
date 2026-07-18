"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface StaffUser {
  name: string;
  email: string;
  role: string;
}

interface Props {
  user?: StaffUser;
  action: (fd: FormData) => Promise<void>;
}

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "baker_retail", label: "Retail Baker" },
  { value: "baker_wholesale", label: "Wholesale Baker" },
];

export function UserForm({ user, action }: Props) {
  const editing = !!user;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" required defaultValue={user?.name} placeholder="Jane Baker" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required defaultValue={user?.email} placeholder="jane@mysassys.com" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Role *</Label>
        <Select name="role" defaultValue={user?.role ?? "baker_retail"}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{editing ? "New Password" : "Password *"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={!editing}
          minLength={8}
          autoComplete="new-password"
          placeholder={editing ? "Leave blank to keep current password" : "At least 8 characters"}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">{editing ? "Save Changes" : "Create User"}</Button>
        <Button asChild variant="outline"><Link href="/admin/users">Cancel</Link></Button>
      </div>
    </form>
  );
}
