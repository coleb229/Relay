"use client";

import { DollarSign, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";

interface RevenueCardsProps {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  refundRate: number;
}

export function RevenueCards({
  totalRevenue,
  totalOrders,
  avgOrderValue,
  refundRate,
}: RevenueCardsProps) {
  return (
    <MetricGrid>
      <StatMetric
        label="Total Revenue"
        value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
      />
      <StatMetric
        label="Orders"
        value={totalOrders.toLocaleString()}
        icon={ShoppingCart}
      />
      <StatMetric
        label="Avg. Order Value"
        value={`$${avgOrderValue.toFixed(2)}`}
        icon={TrendingUp}
      />
      <StatMetric
        label="Refund Rate"
        value={`${refundRate.toFixed(1)}%`}
        icon={RotateCcw}
      />
    </MetricGrid>
  );
}
