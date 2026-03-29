import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/payments/OrdersTable";

export default async function OrdersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all course purchases.
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
