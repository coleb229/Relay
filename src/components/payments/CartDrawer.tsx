"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ShoppingCart, Trash2, LoaderCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItem {
  id: string;
  courseId: string;
  price: number;
  course: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    imageUrl: string | null;
    compareAtPrice: number | null;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchCart();
  }, [open, fetchCart]);

  async function removeItem(itemId: string) {
    setRemovingId(itemId);
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      setCart((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
      );
    } catch {
      // silently fail
    } finally {
      setRemovingId(null);
    }
  }

  async function clearCart() {
    await fetch("/api/cart", { method: "DELETE" });
    setCart((prev) => (prev ? { ...prev, items: [] } : prev));
  }

  async function handleCheckout() {
    if (!cart || cart.items.length === 0) return;
    setCheckingOut(true);
    // For multi-item cart, checkout first item (single course checkout)
    // A full multi-course checkout would need a different endpoint
    const firstItem = cart.items[0];
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: firstItem.courseId,
          ...(couponCode ? { couponCode } : {}),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setCheckingOut(false);
    }
  }

  const subtotal = cart?.items.reduce((sum, item) => sum + item.price, 0) ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="size-4" />
              Cart
              {cart && cart.items.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({cart.items.length})
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse courses and add them to your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-muted/30"
                  >
                    {item.course.imageUrl ? (
                      <img
                        src={item.course.imageUrl}
                        alt={item.course.title}
                        className="size-14 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-14 rounded-md bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.course.compareAtPrice &&
                          item.course.compareAtPrice > item.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${item.course.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingId === item.id}
                      className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 self-start"
                    >
                      {removingId === item.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                ))}

                {cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear cart
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-border px-5 py-4 space-y-3">
              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="text-xs h-8 pl-7"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={async () => {
                    if (!couponCode.trim() || !cart.items[0]) return;
                    const res = await fetch("/api/coupons/validate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        code: couponCode.trim(),
                        courseId: cart.items[0].courseId,
                      }),
                    });
                    const data = await res.json();
                    if (data.valid) setDiscount(data.discount);
                  }}
                >
                  Apply
                </Button>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  `Checkout — $${total.toFixed(2)}`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
