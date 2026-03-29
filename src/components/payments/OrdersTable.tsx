"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LoaderCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  amount: number;
  originalAmount: number;
  status: string;
  stripePaymentId: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; image: string | null };
  course: { id: string; title: string; slug: string; imageUrl: string | null };
  coupon: { id: string; code: string; type: string; value: number } | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  REFUNDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  FAILED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleRefund(orderId: string) {
    if (!confirm("Refund this order? This cannot be undone.")) return;
    setRefundingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "POST" });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "REFUNDED" } : o))
        );
      }
    } catch {
      // silently fail
    } finally {
      setRefundingId(null);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or course..."
            className="pl-8 text-sm h-9"
          />
        </form>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Customer</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Course</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Amount</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Date</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground text-xs uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.user.image ? (
                        <img
                          src={order.user.image}
                          alt=""
                          className="size-6 rounded-full"
                        />
                      ) : (
                        <div className="size-6 rounded-full bg-muted" />
                      )}
                      <div>
                        <p className="font-medium text-xs">
                          {order.user.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium truncate max-w-48">
                      {order.course.title}
                    </p>
                    {order.coupon && (
                      <p className="text-[10px] text-muted-foreground">
                        Coupon: {order.coupon.code}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">
                      ${order.amount.toFixed(2)}
                    </span>
                    {order.originalAmount !== order.amount && (
                      <span className="text-xs text-muted-foreground line-through ml-1">
                        ${order.originalAmount.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusColors[order.status] || statusColors.FAILED
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {order.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleRefund(order.id)}
                        disabled={refundingId === order.id}
                      >
                        {refundingId === order.id ? (
                          <LoaderCircle className="size-3 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3" />
                        )}
                        Refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
