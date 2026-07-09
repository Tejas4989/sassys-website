"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { loadOrderIntoCart } from "@/lib/actions/wholesale-cart";

export function ReorderFromHistoryButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleReorder() {
    startTransition(async () => {
      try {
        await loadOrderIntoCart(orderId);
        toast.success("Order loaded into cart!");
        router.push("/wholesale");
      } catch {
        toast.error("Could not load that order.");
      }
    });
  }

  return (
    <button
      onClick={handleReorder}
      disabled={pending}
      className="flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
      Reorder
    </button>
  );
}
