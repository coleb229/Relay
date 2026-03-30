"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { buttonConfigSchema } from "../schemas";

type ButtonConfig = z.infer<typeof buttonConfigSchema>;

interface ButtonEditorProps {
  config: ButtonConfig;
  onChange: (config: ButtonConfig) => void;
}

const VARIANT_OPTIONS = [
  { value: "solid", label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
] as const;

const SIZE_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
] as const;

const RADIUS_OPTIONS = [
  { value: "none", label: "0" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "full", label: "Pill" },
] as const;

export function ButtonEditor({ config, onChange }: ButtonEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="btn-text">Button Text</Label>
        <Input
          id="btn-text"
          value={config.text}
          onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Click Here"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="btn-href">Link URL</Label>
        <Input
          id="btn-href"
          value={config.href}
          onChange={(e) => onChange({ ...config, href: e.target.value })}
          placeholder="/enroll or https://..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="btn-blank"
          checked={config.target === "_blank"}
          onCheckedChange={(checked) =>
            onChange({ ...config, target: checked ? "_blank" : "_self" })
          }
        />
        <Label htmlFor="btn-blank" className="cursor-pointer">
          Open in new tab
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label>Variant</Label>
        <ToggleGroup
          value={[config.variant]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({ ...config, variant: values[0] as ButtonConfig["variant"] });
          }}
          variant="outline"
          size="sm"
        >
          {VARIANT_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label>Size</Label>
        <ToggleGroup
          value={[config.size]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({ ...config, size: values[0] as ButtonConfig["size"] });
          }}
          variant="outline"
          size="sm"
        >
          {SIZE_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label>Border Radius</Label>
        <ToggleGroup
          value={[config.borderRadius]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({ ...config, borderRadius: values[0] as ButtonConfig["borderRadius"] });
          }}
          variant="outline"
          size="sm"
        >
          {RADIUS_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="btn-fullwidth"
          checked={config.fullWidth}
          onCheckedChange={(checked) =>
            onChange({ ...config, fullWidth: !!checked })
          }
        />
        <Label htmlFor="btn-fullwidth" className="cursor-pointer">
          Full width
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label>Background Color</Label>
        <div className="flex items-center gap-2">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            style={{ backgroundColor: config.bgColor ?? "oklch(0.44 0.24 275)" }}
          />
          <Input
            value={config.bgColor ?? ""}
            onChange={(e) => onChange({ ...config, bgColor: e.target.value || null })}
            placeholder="oklch(0.44 0.24 275)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Text Color</Label>
        <div className="flex items-center gap-2">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            style={{ backgroundColor: config.textColor ?? "#ffffff" }}
          />
          <Input
            value={config.textColor ?? ""}
            onChange={(e) => onChange({ ...config, textColor: e.target.value || null })}
            placeholder="#ffffff"
          />
        </div>
      </div>

      {config.variant === "outline" && (
        <div className="space-y-1.5">
          <Label>Border Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="size-7 shrink-0 rounded-md border border-input"
              style={{ backgroundColor: config.borderColor ?? config.bgColor ?? "oklch(0.44 0.24 275)" }}
            />
            <Input
              value={config.borderColor ?? ""}
              onChange={(e) => onChange({ ...config, borderColor: e.target.value || null })}
              placeholder="Same as background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
