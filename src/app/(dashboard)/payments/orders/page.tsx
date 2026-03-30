import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/payments/OrdersTable";
import { PageHeader } from "@/components/ui/page-header";

export default async function OrdersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage all course purchases."
      />
      <OrdersTable />
    </div>
  );
}
