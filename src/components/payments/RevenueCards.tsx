"use client";

import { DollarSign, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const cards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15",
      gradient: "from-emerald-500/15 to-green-500/5",
    },
    {
      title: "Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15",
      gradient: "from-blue-500/15 to-cyan-500/5",
    },
    {
      title: "Avg. Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/15",
      gradient: "from-violet-500/15 to-purple-500/5",
    },
    {
      title: "Refund Rate",
      value: `${refundRate.toFixed(1)}%`,
      icon: RotateCcw,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15",
      gradient: "from-amber-500/15 to-orange-500/5",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
          <div className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none`} />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`${card.iconBg} rounded-lg p-2`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
