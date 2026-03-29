import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <XCircle className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your payment was not processed. No charges were made to your account.
      </p>
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/courses" />}
          nativeButton={false}
        >
          Browse Courses
        </Button>
      </div>
    </div>
  );
}
