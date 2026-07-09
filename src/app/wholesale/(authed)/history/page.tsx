import { auth } from "@/lib/auth";
import {
  getWholesaleOrderHistory,
  getWholesaleCustomerByUserId,
} from "@/lib/data/wholesale";
import { ReorderFromHistoryButton } from "@/components/wholesale/reorder-from-history";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 0;

export default async function WholesaleHistoryPage() {
  const session = await auth();
  const customerRow = await getWholesaleCustomerByUserId(session!.user.id!);
  const customerId = customerRow!.customer.id;

  const history = await getWholesaleOrderHistory(customerId, 30);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Order History</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your last {history.length} orders. Click &quot;Reorder&quot; to load any past order into your cart.
      </p>

      {history.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-mono text-muted-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <Badge variant={order.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>
                        {order.createdAt instanceof Date
                          ? order.createdAt.toLocaleDateString("en-CA", { dateStyle: "medium" })
                          : new Date(order.createdAt).toLocaleDateString("en-CA", { dateStyle: "medium" })}
                      </span>
                      {order.fulfillment === "delivery" ? (
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery {order.deliveryDate}</span>
                      ) : (
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Pickup</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(order.totalCents / 100).toFixed(2)}</p>
                    <ReorderFromHistoryButton orderId={order.id} />
                  </div>
                </div>

                <ul className="space-y-0.5">
                  {order.items.map((i) => (
                    <li key={i.id} className="text-xs text-muted-foreground">
                      {i.qty}× {i.name}
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="text-xs italic text-muted-foreground mt-2 border-l-2 border-border pl-2">
                    {order.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
