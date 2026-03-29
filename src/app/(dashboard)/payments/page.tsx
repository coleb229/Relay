import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { PaymentsDashboard } from "./PaymentsDashboard";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return <PaymentsDashboard />;
}
