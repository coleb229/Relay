"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "./CartDrawer";

export function CartIcon() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCount(data.items?.length ?? 0);
        }
      } catch {
        // silently fail
      }
    }
    fetchCount();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-md hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
        aria-label="Open cart"
      >
        <ShoppingCart className="size-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
