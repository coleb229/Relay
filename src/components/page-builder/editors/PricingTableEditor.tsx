"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { pricingTableConfigSchema } from "../schemas";

type PricingTableConfig = z.infer<typeof pricingTableConfigSchema>;

interface PricingTableEditorProps {
  config: PricingTableConfig;
  onChange: (config: PricingTableConfig) => void;
}

export function PricingTableEditor({ config, onChange }: PricingTableEditorProps) {
  function updateFeature(index: number, value: string) {
    const features = [...config.features];
    features[index] = value;
    onChange({ ...config, features });
  }

  function addFeature() {
    onChange({ ...config, features: [...config.features, ""] });
  }

  function removeFeature(index: number) {
    const features = config.features.filter((_, i) => i !== index);
    onChange({ ...config, features });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pricing-heading">Heading</Label>
        <Input
          id="pricing-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Pricing"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pricing-description">Description</Label>
        <Textarea
          id="pricing-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={2}
          placeholder="Everything you need to get started..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="pricing-compare"
          checked={config.showCompareAtPrice}
          onCheckedChange={(checked) =>
            onChange({ ...config, showCompareAtPrice: checked })
          }
        />
        <Label htmlFor="pricing-compare" className="cursor-pointer">
          Show compare-at price
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pricing-cta-text">CTA Text</Label>
        <Input
          id="pricing-cta-text"
          value={config.ctaText}
          onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
          placeholder="Enroll Now"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pricing-cta-link">CTA Link</Label>
        <Input
          id="pricing-cta-link"
          value={config.ctaLink}
          onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
          placeholder="/enroll"
        />
      </div>

      <div className="space-y-3">
        <Label>Features</Label>
        {config.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="Feature included"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeFeature(index)}
              aria-label={`Remove feature ${index + 1}`}
            >
              <TrashIcon className="size-3" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addFeature} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Feature
        </Button>
      </div>
    </div>
  );
}
