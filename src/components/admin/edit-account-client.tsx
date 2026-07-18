"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw, Power, PowerOff, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { WholesaleAccountForm } from "@/components/admin/wholesale-account-form";
import { updateWholesaleAccount, toggleWholesaleAccount, rotatePasscode } from "@/lib/actions/wholesale-accounts";

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
  id: string;
  account: Account;
  created: boolean;
  initialPasscode: string;
}

export function EditAccountClient({ id, account, created, initialPasscode }: Props) {
  const [newPasscode, setNewPasscode] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleRotate() {
    startTransition(async () => {
      try {
        const code = await rotatePasscode(id);
        setNewPasscode(code);
        toast.success("Passcode rotated. Share the new code with the customer.");
      } catch {
        toast.error("Failed to rotate passcode.");
      }
    });
  }

  function handleToggle(active: boolean) {
    startTransition(async () => {
      try {
        await toggleWholesaleAccount(id, active);
        toast.success(active ? "Account enabled." : "Account disabled.");
        router.refresh();
      } catch {
        toast.error("Failed to update account.");
      }
    });
  }

  const displayPasscode = newPasscode || (created ? initialPasscode : "");

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/accounts"><ArrowLeft className="w-4 h-4 mr-1" /> Accounts</Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">Edit Account</h1>
      </div>

      {/* Passcode reveal banner */}
      {displayPasscode && (
        <Card className="border-amber-400/50 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">
              {created ? "Account created!" : "Passcode rotated!"}
            </p>
            <p className="text-xs text-amber-700 mb-3">
              Share this passcode with the customer. It will not be shown again after you leave this page.
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold tracking-[0.3em] text-amber-900">
                {displayPasscode}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(displayPasscode); toast.success("Copied!"); }}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRotate} disabled={pending}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Rotate Passcode
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-green-700 border-green-400 hover:bg-green-50"
            onClick={() => handleToggle(true)}
            disabled={pending}
          >
            <Power className="w-4 h-4 mr-1" /> Enable
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/5"
            onClick={() => handleToggle(false)}
            disabled={pending}
          >
            <PowerOff className="w-4 h-4 mr-1" /> Disable
          </Button>
        </CardContent>
      </Card>

      <WholesaleAccountForm
        account={account}
        customerId={id}
        action={updateWholesaleAccount.bind(null, id)}
      />
    </div>
  );
}
