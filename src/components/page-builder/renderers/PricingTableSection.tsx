"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { PricingTableSection as PricingTableSectionType } from "../schemas";

interface PricingTableSectionProps {
  config: PricingTableSectionType["config"];
  context?: {
    price?: number | null;
    compareAtPrice?: number | null;
  };
}

function formatPrice(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "Free";
  return `$${amount.toFixed(2)}`;
}

export function PricingTableSection({
  config,
  context,
}: PricingTableSectionProps) {
  const { heading, description, showCompareAtPrice, ctaText, ctaLink, features } =
    config;
  const price = context?.price;
  const compareAtPrice = context?.compareAtPrice;
  const isFree = price == null || price === 0;

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mx-auto max-w-md rounded-xl border border-border p-8 shadow-md">
        <div className="mb-6 text-center">
          {compareAtPrice && showCompareAtPrice && !isFree && (
            <p className="text-sm tabular-nums text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </p>
          )}
          <p className="text-4xl font-bold tabular-nums text-foreground">
            {formatPrice(price)}
          </p>
        </div>

        {features.length > 0 && (
          <ul className="mb-8 space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {ctaText && (
          <Button
            variant="default"
            size="lg"
            render={<a href={ctaLink || "#"} />}
            className="w-full py-3"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
}
