"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { dividerSpacerConfigSchema } from "../schemas";

type DividerSpacerConfig = z.infer<typeof dividerSpacerConfigSchema>;

interface DividerSpacerEditorProps {
  config: DividerSpacerConfig;
  onChange: (config: DividerSpacerConfig) => void;
}

const VARIANT_OPTIONS = [
  { value: "line", label: "Line" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "space_only", label: "Space Only" },
] as const;

const THICKNESS_OPTIONS = [
  { value: "thin", label: "Thin" },
  { value: "medium", label: "Medium" },
  { value: "thick", label: "Thick" },
] as const;

const WIDTH_OPTIONS = [
  { value: "quarter", label: "25%" },
  { value: "half", label: "50%" },
  { value: "three_quarter", label: "75%" },
  { value: "full", label: "100%" },
] as const;

const SPACING_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
] as const;

export function DividerSpacerEditor({ config, onChange }: DividerSpacerEditorProps) {
  const isSpaceOnly = config.variant === "space_only";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Variant</Label>
        <ToggleGroup
          value={[config.variant]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                variant: values[0] as DividerSpacerConfig["variant"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          {VARIANT_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Variant ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {!isSpaceOnly && (
        <>
          <div className="space-y-1.5">
            <Label>Thickness</Label>
            <ToggleGroup
              value={[config.thickness]}
              onValueChange={(values) => {
                if (values.length > 0) {
                  onChange({
                    ...config,
                    thickness: values[0] as DividerSpacerConfig["thickness"],
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              {THICKNESS_OPTIONS.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Thickness ${opt.label}`}>
                  <span className="text-xs font-medium">{opt.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-1.5">
            <Label>Width</Label>
            <ToggleGroup
              value={[config.width]}
              onValueChange={(values) => {
                if (values.length > 0) {
                  onChange({
                    ...config,
                    width: values[0] as DividerSpacerConfig["width"],
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              {WIDTH_OPTIONS.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Width ${opt.label}`}>
                  <span className="text-xs font-medium">{opt.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="divider-color">Color</Label>
            <div className="flex items-center gap-2">
              <div
                className="size-8 shrink-0 rounded-md border border-input"
                style={{ backgroundColor: config.color ?? "#e5e7eb" }}
              />
              <Input
                id="divider-color"
                value={config.color ?? ""}
                onChange={(e) =>
                  onChange({ ...config, color: e.target.value || null })
                }
                placeholder="#e5e7eb"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label>Spacing</Label>
        <ToggleGroup
          value={[config.spacingY]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                spacingY: values[0] as DividerSpacerConfig["spacingY"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          {SPACING_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Spacing ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
