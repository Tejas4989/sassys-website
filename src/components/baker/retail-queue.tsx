"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, RefreshCw, Phone, Mail } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  priceCents: number;
}

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  pickupAt?: string | null;
  totalCents: number;
  paymentMethod: string;
  isCatering: boolean;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "secondary",
  confirmed: "default",
  ready: "outline",
};

export function RetailQueue() {
  const qc = useQueryClient();

  const { data, isLoading, error, dataUpdatedAt } = useQuery<{
    orders: Order[];
    fetchedAt: string;
  }>({
    queryKey: ["retail-queue"],
    queryFn: () => fetch("/api/orders/retail/queue").then((r) => r.json()),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false, // pause when tab not visible
  });

  const markReady = useMutation({
    mutationFn: (orderId: string) =>
      fetch(`/api/orders/${orderId}/ready`, { method: "POST" }).then((r) =>
        r.json()
      ),
    onSuccess: (_, orderId) => {
      toast.success("Order marked as ready — customer notified.");
      qc.invalidateQueries({ queryKey: ["retail-queue"] });
    },
    onError: () => toast.error("Failed to mark order ready."),
  });

  const orders = data?.orders ?? [];
  const pending = orders.filter((o) => o.status === "pending");
  const confirmed = orders.filter((o) => o.status === "confirmed");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Retail Queue</h1>
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every 5 seconds.{" "}
            {dataUpdatedAt
              ? `Last: ${new Date(dataUpdatedAt).toLocaleTimeString("en-CA")}`
              : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries({ queryKey: ["retail-queue"] })}
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading orders…
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          Failed to load orders. Check your connection.
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">All clear — no pending orders.</p>
        </div>
      )}

      {/* Pending orders — need confirmation */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
            Pending ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onMarkReady={() => markReady.mutate(order.id)}
                markingReady={markReady.isPending && markReady.variables === order.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Confirmed orders — in progress */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            Confirmed / In Progress ({confirmed.length})
          </h2>
          <div className="space-y-3">
            {confirmed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onMarkReady={() => markReady.mutate(order.id)}
                markingReady={markReady.isPending && markReady.variables === order.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onMarkReady,
  markingReady,
}: {
  order: Order;
  onMarkReady: () => void;
  markingReady: boolean;
}) {
  return (
    <Card className={order.isCatering ? "border-amber-400/50 bg-amber-50/30" : ""}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold">{order.customerName}</p>
              <Badge variant={STATUS_COLOR[order.status] as any} className="text-xs">
                {STATUS_LABEL[order.status]}
              </Badge>
              {order.isCatering && (
                <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                  Catering
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1 hover:text-primary">
                <Mail className="w-3 h-3" /> {order.customerEmail}
              </a>
              {order.customerPhone && (
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="w-3 h-3" /> {order.customerPhone}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">${(order.totalCents / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {order.paymentMethod.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {order.pickupAt && (
          <div className="flex items-center gap-1.5 text-xs font-medium mb-3 text-primary">
            <Clock className="w-3.5 h-3.5" />
            Pickup:{" "}
            {new Date(order.pickupAt).toLocaleString("en-CA", {
              timeZone: "America/Toronto",
              dateStyle: "short",
              timeStyle: "short",
            })}
          </div>
        )}

        <ul className="space-y-0.5 mb-3">
          {order.items.map((i) => (
            <li key={i.id} className="text-sm text-muted-foreground">
              {i.qty}× {i.name}
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="text-xs italic text-muted-foreground mb-3 border-l-2 border-amber-300 pl-2">
            {order.notes}
          </p>
        )}

        <Button
          size="sm"
          onClick={onMarkReady}
          disabled={markingReady || order.status === "ready"}
          className="w-full"
        >
          <CheckCircle2 className="mr-1.5 w-3.5 h-3.5" />
          {markingReady ? "Notifying…" : "Mark Ready & Notify Customer"}
        </Button>
      </CardContent>
    </Card>
  );
}
