"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PasscodeInput } from "@/components/wholesale/passcode-input";

export default function WholesaleLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "passcode">("email");
  const [email, setEmail] = useState("");

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = (new FormData(e.currentTarget).get("email") as string).trim().toLowerCase();
    if (!val) return;
    setEmail(val);
    setStep("passcode");
  }

  async function handlePasscodeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const passcode = new FormData(e.currentTarget).get("passcode") as string;

    if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
      toast.error("Enter all 6 digits.");
      return;
    }

    setLoading(true);
    const res = await signIn("wholesale", { email, passcode, redirect: false });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or passcode. Too many attempts will lock the account.");
    } else {
      // NextAuth updates session — check if passcode must change
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.passcodeMustChange) {
        router.push("/wholesale/change-passcode");
      } else {
        router.push("/wholesale");
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "oklch(0.32 0.06 45)" }}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <p className="font-heading text-3xl font-bold text-primary">Sassy&apos;s</p>
          <p className="text-sm text-muted-foreground font-medium">Wholesale Portal</p>
        </CardHeader>
        <CardContent className="pt-4">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="you@business.com"
                />
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Enter your 6-digit passcode for
                </p>
                <p className="font-medium text-sm">{email}</p>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Not you? Change email
                </button>
              </div>

              <PasscodeInput name="passcode" autoFocus />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Sign In
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Forgot your passcode? Contact Sassy&apos;s at{" "}
                <a href="tel:+15194611234" className="text-primary hover:underline">
                  (519) 461-1234
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
