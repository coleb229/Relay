"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface BannerConfig {
  message: string;
  variant: "info" | "success" | "warning" | "announcement";
  icon: boolean;
  ctaText: string;
  ctaLink: string;
  dismissible: boolean;
  sticky: boolean;
}

interface BannerEditorProps {
  config: BannerConfig;
  onChange: (config: BannerConfig) => void;
}

export function BannerEditor({ config, onChange }: BannerEditorProps) {
  return (
    <div className="space-y-4">
      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="banner-message">Message</Label>
        <textarea
          id="banner-message"
          value={config.message}
          onChange={(e) => onChange({ ...config, message: e.target.value })}
          placeholder="Enter your banner message..."
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      {/* Variant */}
      <div className="space-y-1.5">
        <Label>Variant</Label>
        <ToggleGroup
          value={[config.variant]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, variant: values[0] as BannerConfig["variant"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="info">Info</ToggleGroupItem>
          <ToggleGroupItem value="success">Success</ToggleGroupItem>
          <ToggleGroupItem value="warning">Warning</ToggleGroupItem>
          <ToggleGroupItem value="announcement">Announce</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Show icon */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="banner-icon"
          checked={config.icon}
          onCheckedChange={(checked) =>
            onChange({ ...config, icon: checked === true })
          }
        />
        <Label htmlFor="banner-icon" className="text-xs">
          Show icon
        </Label>
      </div>

      {/* CTA */}
      <div className="space-y-1.5">
        <Label htmlFor="banner-cta-text">CTA Text</Label>
        <Input
          id="banner-cta-text"
          value={config.ctaText}
          onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
          placeholder="Learn More"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner-cta-link">CTA Link</Label>
        <Input
          id="banner-cta-link"
          value={config.ctaLink}
          onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Dismissible */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="banner-dismissible"
          checked={config.dismissible}
          onCheckedChange={(checked) =>
            onChange({ ...config, dismissible: checked === true })
          }
        />
        <Label htmlFor="banner-dismissible" className="text-xs">
          Dismissible
        </Label>
      </div>

      {/* Sticky */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="banner-sticky"
          checked={config.sticky}
          onCheckedChange={(checked) =>
            onChange({ ...config, sticky: checked === true })
          }
        />
        <Label htmlFor="banner-sticky" className="text-xs">
          Sticky (stays at top on scroll)
        </Label>
      </div>
    </div>
  );
}
