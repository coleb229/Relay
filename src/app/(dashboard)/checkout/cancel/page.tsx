import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CheckoutCancelPage() {
  return (
    <EmptyState
      icon={XCircle}
      title="Payment Cancelled"
      description="Your payment was not processed. No charges were made to your account."
      variant="centered"
    >
      <Button
        render={<Link href="/courses" />}
        nativeButton={false}
      >
        Browse Courses
      </Button>
    </EmptyState>
  );
}
