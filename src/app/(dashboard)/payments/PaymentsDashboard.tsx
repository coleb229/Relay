"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoaderCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RevenueCards } from "@/components/payments/RevenueCards";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RevenueChart = dynamic(
  () =>
    import("@/components/payments/RevenueChart").then((mod) => ({
      default: mod.RevenueChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border p-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    ),
  }
);
import { OrdersTable } from "@/components/payments/OrdersTable";

interface RevenueData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  refundRate: number;
  revenueByMonth: { month: string; revenue: number }[];
  topCourses: { id: string; title: string; revenue: number }[];
}

export function PaymentsDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch("/api/revenue");
        if (res.ok) setData(await res.json());
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                <div className="size-8 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="h-8 w-28 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue overview and order management.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-3">
              <CreditCard className="size-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No revenue data</h2>
            <p className="text-sm text-muted-foreground max-w-sm">Connect Stripe or check the API configuration to see payment analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revenue overview and order management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/payments/orders" />}
            nativeButton={false}
          >
            All Orders
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/payments/coupons" />}
            nativeButton={false}
          >
            Coupons
          </Button>
        </div>
      </div>

      {data && (
        <>
          <RevenueCards
            totalRevenue={data.totalRevenue}
            totalOrders={data.totalOrders}
            avgOrderValue={data.avgOrderValue}
            refundRate={data.refundRate}
          />
          <RevenueChart data={data.revenueByMonth} />
        </>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
        <OrdersTable />
      </div>
    </div>
  );
}
