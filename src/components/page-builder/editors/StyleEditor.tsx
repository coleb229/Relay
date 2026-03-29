"use client";

import type { SectionStyle } from "../schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  AlignCenterVertical,
  ArrowDownToLine,
} from "lucide-react";

interface StyleEditorProps {
  style: SectionStyle;
  onChange: (style: Partial<SectionStyle>) => void;
}

const PADDING_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
] as const;

const PADDING_X_OPTIONS = [
  { value: "none", label: "0" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
] as const;

const RADIUS_OPTIONS = [
  { value: "none", label: "0" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
] as const;

const SHADOW_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
] as const;

const MAX_WIDTH_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
  { value: "full", label: "Full" },
] as const;

export function StyleEditor({ style, onChange }: StyleEditorProps) {
  return (
    <div className="space-y-4">
      {/* Alignment */}
      <div className="space-y-1.5">
        <Label>Alignment</Label>
        <ToggleGroup
          value={[style.alignment]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ alignment: values[0] as SectionStyle["alignment"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Vertical Alignment */}
      <div className="space-y-1.5">
        <Label>Vertical Alignment</Label>
        <ToggleGroup
          value={[style.verticalAlignment]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                verticalAlignment: values[0] as SectionStyle["verticalAlignment"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="top" aria-label="Align top">
            <ArrowUpToLine className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenterVertical className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="bottom" aria-label="Align bottom">
            <ArrowDownToLine className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Vertical Padding */}
      <div className="space-y-1.5">
        <Label>Vertical Padding</Label>
        <ToggleGroup
          value={[style.paddingY]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ paddingY: values[0] as SectionStyle["paddingY"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {PADDING_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Padding ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Horizontal Padding */}
      <div className="space-y-1.5">
        <Label>Horizontal Padding</Label>
        <ToggleGroup
          value={[style.paddingX]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ paddingX: values[0] as SectionStyle["paddingX"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {PADDING_X_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Horizontal padding ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Border Radius */}
      <div className="space-y-1.5">
        <Label>Border Radius</Label>
        <ToggleGroup
          value={[style.borderRadius]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ borderRadius: values[0] as SectionStyle["borderRadius"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {RADIUS_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Radius ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Box Shadow */}
      <div className="space-y-1.5">
        <Label>Box Shadow</Label>
        <ToggleGroup
          value={[style.boxShadow]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ boxShadow: values[0] as SectionStyle["boxShadow"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {SHADOW_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Shadow ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Max Width */}
      <div className="space-y-1.5">
        <Label>Max Width</Label>
        <ToggleGroup
          value={[style.maxWidth]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ maxWidth: values[0] as SectionStyle["maxWidth"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {MAX_WIDTH_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Max width ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Background Color */}
      <div className="space-y-1.5">
        <Label>Background Color</Label>
        <div className="flex items-center gap-2">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            style={{ backgroundColor: style.backgroundColor ?? "transparent" }}
          />
          <Input
            value={style.backgroundColor ?? ""}
            onChange={(e) =>
              onChange({ backgroundColor: e.target.value || null })
            }
            placeholder="oklch(0.95 0 0) or #f5f5f5"
          />
        </div>
      </div>

      {/* Background Gradient */}
      <div className="space-y-1.5">
        <Label>Background Gradient</Label>
        <div className="flex items-center gap-2">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            style={{ backgroundImage: style.backgroundGradient ?? undefined }}
          />
          <Input
            value={style.backgroundGradient ?? ""}
            onChange={(e) =>
              onChange({ backgroundGradient: e.target.value || null })
            }
            placeholder="linear-gradient(135deg, #667eea, #764ba2)"
          />
        </div>
      </div>

      {/* Background Image URL */}
      <div className="space-y-1.5">
        <Label>Background Image URL</Label>
        <Input
          value={style.backgroundImageUrl ?? ""}
          onChange={(e) =>
            onChange({ backgroundImageUrl: e.target.value || null })
          }
          placeholder="https://example.com/bg.jpg"
        />
      </div>
    </div>
  );
}
