"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PasscodeInput } from "@/components/wholesale/passcode-input";
import { changeOwnPasscode } from "@/lib/actions/wholesale-accounts";

export default function ChangePasscodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const passcode = fd.get("passcode") as string;
    const confirm = fd.get("confirm") as string;

    if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
      toast.error("Enter all 6 digits for your new passcode.");
      return;
    }
    if (passcode !== confirm) {
      toast.error("Passcodes do not match.");
      return;
    }

    setLoading(true);
    try {
      await changeOwnPasscode(passcode);
      toast.success("Passcode set! Welcome to the wholesale portal.");
      router.push("/wholesale");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "oklch(0.32 0.06 45)" }}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <p className="font-heading text-xl font-bold">Set Your Passcode</p>
          <p className="text-sm text-muted-foreground">
            Choose a 6-digit passcode you&apos;ll use to log in each time.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-center mb-3">New Passcode</p>
              <PasscodeInput name="passcode" autoFocus />
            </div>
            <div>
              <p className="text-sm font-medium text-center mb-3">Confirm Passcode</p>
              <PasscodeInput name="confirm" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Set Passcode & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
