"use client";

import { useState } from "react";
import { LoaderCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckoutButtonProps {
  courseId: string;
  price: number;
  showCouponInput?: boolean;
}

export function CheckoutButton({ courseId, price, showCouponInput = true }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), courseId }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setError(null);
      } else {
        setDiscount(null);
        setError(data.reason || "Invalid coupon");
      }
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Checkout failed");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const finalPrice = discount ? Math.max(0, price - discount) : price;

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={loading} onClick={handleCheckout}>
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          `$${finalPrice.toFixed(2)} — Enroll Now`
        )}
      </Button>

      {showCouponInput && !showCoupon && (
        <button
          type="button"
          onClick={() => setShowCoupon(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) flex items-center gap-1 mx-auto"
        >
          <Tag className="size-3" />
          Have a coupon?
        </button>
      )}

      {showCoupon && (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setDiscount(null);
            }}
            placeholder="Coupon code"
            className="text-xs h-8"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={validateCoupon}
            disabled={validatingCoupon || !couponCode.trim()}
            className="h-8 text-xs shrink-0"
          >
            {validatingCoupon ? <LoaderCircle className="size-3 animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}

      {discount !== null && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
          Coupon applied! You save ${discount.toFixed(2)}
        </p>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
