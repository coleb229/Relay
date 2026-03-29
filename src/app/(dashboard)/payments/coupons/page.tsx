import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { CouponManager } from "@/components/payments/CouponManager";

export default async function CouponsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <CouponManager />
    </div>
  );
}
