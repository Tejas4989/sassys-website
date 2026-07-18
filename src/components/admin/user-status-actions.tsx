"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleUser } from "@/lib/actions/users";

export function UserStatusActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle(active: boolean) {
    startTransition(async () => {
      try {
        await toggleUser(userId, active);
        toast.success(active ? "User enabled." : "User disabled.");
        router.refresh();
      } catch {
        toast.error("Failed to update user.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isActive ? (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/40 hover:bg-destructive/5"
          onClick={() => handleToggle(false)}
          disabled={pending}
        >
          <PowerOff className="w-4 h-4 mr-1" /> Disable
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-green-700 border-green-400 hover:bg-green-50"
          onClick={() => handleToggle(true)}
          disabled={pending}
        >
          <Power className="w-4 h-4 mr-1" /> Enable
        </Button>
      )}
    </div>
  );
}
