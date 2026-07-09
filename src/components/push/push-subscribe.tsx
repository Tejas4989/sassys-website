"use client";

import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePush } from "./use-push";

interface Props {
  email: string;
}

export function PushSubscribe({ email }: Props) {
  const { state, loading, subscribe, unsubscribe } = usePush(email);

  if (state === "unsupported") return null;

  if (state === "subscribed") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <BellRing className="w-4 h-4" />
        <span>Notifications on — we&apos;ll ping you when your order is ready.</span>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="text-xs text-muted-foreground hover:underline ml-1"
        >
          Turn off
        </button>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <BellOff className="w-3.5 h-3.5" />
        Notifications blocked by your browser. Enable them in browser settings to get pickup alerts.
      </p>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={subscribe}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      Get notified when ready
    </Button>
  );
}
