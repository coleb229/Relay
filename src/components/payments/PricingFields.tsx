"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingFieldsProps {
  pricingType: string;
  price: string;
  compareAtPrice: string;
  onPricingTypeChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onCompareAtPriceChange: (value: string) => void;
}

export function PricingFields({
  pricingType,
  price,
  compareAtPrice,
  onPricingTypeChange,
  onPriceChange,
  onCompareAtPriceChange,
}: PricingFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Pricing Model</Label>
        <Select value={pricingType} onValueChange={(v) => onPricingTypeChange(v ?? "FREE")}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="ONE_TIME">One-time Payment</SelectItem>
            {/* SUBSCRIPTION not yet in Prisma schema — uncomment when enum is added */}
            {/* <SelectItem value="SUBSCRIPTION">Subscription</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {pricingType !== "FREE" && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="price">
              Price{" "}
              <span className="text-muted-foreground font-normal">(USD)</span>
            </Label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                $
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="compare-at-price">
              Compare-at Price{" "}
              <span className="text-muted-foreground font-normal">(optional, shows as strikethrough)</span>
            </Label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                $
              </span>
              <Input
                id="compare-at-price"
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => onCompareAtPriceChange(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
        </>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <p className="text-sm font-medium">Access Model</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {pricingType === "FREE"
            ? "This course is free. Anyone can enroll without payment."
            : pricingType === "SUBSCRIPTION"
              ? `Students will pay $${price ? parseFloat(price).toFixed(2) : "0.00"}/month to access this course.`
              : `Students will pay $${price ? parseFloat(price).toFixed(2) : "0.00"} to enroll in this course.`}
        </p>
      </div>
    </div>
  );
}
