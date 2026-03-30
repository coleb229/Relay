"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoaderCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payments" description="Revenue overview and order management." />
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={CreditCard}
              title="No revenue data"
              description="Connect Stripe or check the API configuration to see payment analytics."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Revenue overview and order management.">
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
      </PageHeader>

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
