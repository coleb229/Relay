"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LoaderCircle,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  isActive: boolean;
  maxRedemptions: number | null;
  currentRedemptions: number;
  expiresAt: string | null;
  createdAt: string;
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons?limit=100");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleCreate() {
    if (!code.trim() || !value) {
      setFormError("Code and value are required");
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: parseFloat(value),
          maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
          expiresAt: expiresAt || null,
        }),
      });
      if (res.ok) {
        const coupon = await res.json();
        setCoupons((prev) => [coupon, ...prev]);
        setDialogOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to create coupon");
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setTogglingId(coupon.id);
    const newActive = !coupon.isActive;
    // Optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newActive } : c))
    );
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (!res.ok) {
        // Revert
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c
          )
        );
      }
    } catch {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c
        )
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  function resetForm() {
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setMaxRedemptions("");
    setExpiresAt("");
    setFormError(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Coupons</h2>
          <p className="text-sm text-muted-foreground">
            Manage discount codes for your courses.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger
            render={<Button size="sm" className="gap-1.5" />}
          >
            <Plus className="size-3.5" />
            Create Coupon
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                  id="coupon-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SAVE20"
                  className="uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "PERCENTAGE" | "FIXED")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-value">Value</Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    min="0"
                    step={type === "PERCENTAGE" ? "1" : "0.01"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "PERCENTAGE" ? "20" : "9.99"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="max-redemptions">Max Uses</Label>
                  <Input
                    id="max-redemptions"
                    type="number"
                    min="0"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expires-at">Expires</Label>
                  <Input
                    id="expires-at"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              {formError && (
                <p className="text-xs text-destructive">{formError}</p>
              )}
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No coupons yet. Create one to get started.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Code</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Discount</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Uses</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Expires</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Status</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border last:border-0 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : <span className="tabular-nums">${`$${coupon.value.toFixed(2)}`}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {coupon.currentRedemptions}
                    {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(coupon)}
                      disabled={togglingId === coupon.id}
                      className="flex items-center gap-1.5 text-xs rounded-md px-2 py-1 -mx-2 -my-1 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted disabled:opacity-50"
                    >
                      {coupon.isActive ? (
                        <>
                          <ToggleRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deletingId === coupon.id}
                      className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                    >
                      {deletingId === coupon.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
