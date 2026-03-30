"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GlobeIcon, CodeXmlIcon, ShieldAlertIcon } from "lucide-react";
import type { z } from "zod";
import type { embedConfigSchema } from "../schemas";

type EmbedConfig = z.infer<typeof embedConfigSchema>;

interface EmbedEditorProps {
  config: EmbedConfig;
  onChange: (config: EmbedConfig) => void;
}

const HEIGHTS = [
  { value: "sm", label: "Small (200px)" },
  { value: "md", label: "Medium (400px)" },
  { value: "lg", label: "Large (600px)" },
  { value: "xl", label: "Extra Large (800px)" },
  { value: "custom", label: "Custom" },
] as const;

const ASPECT_RATIOS = [
  { value: "auto", label: "Auto (fixed height)" },
  { value: "16:9", label: "16:9 (widescreen)" },
  { value: "4:3", label: "4:3 (standard)" },
  { value: "1:1", label: "1:1 (square)" },
] as const;

export function EmbedEditor({ config, onChange }: EmbedEditorProps) {
  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs">Embed Type</Label>
        <ToggleGroup
          value={[config.mode]}
          onValueChange={(values) => {
            if (values.length > 0) onChange({ ...config, mode: values[values.length - 1] as "url" | "html" });
          }}
        >
          <ToggleGroupItem value="url" className="gap-1.5">
            <GlobeIcon className="h-3.5 w-3.5" />
            URL
          </ToggleGroupItem>
          <ToggleGroupItem value="html" className="gap-1.5">
            <CodeXmlIcon className="h-3.5 w-3.5" />
            HTML
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* URL input or HTML textarea */}
      {config.mode === "url" ? (
        <div className="space-y-1.5">
          <Label className="text-xs">Embed URL</Label>
          <Input
            value={config.url}
            onChange={(e) => onChange({ ...config, url: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
          />
          <p className="text-[10px] text-muted-foreground">
            Paste an embed URL from YouTube, Vimeo, Google Forms, Typeform, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs">Custom HTML</Label>
          <Textarea
            value={config.html}
            onChange={(e) => onChange({ ...config, html: e.target.value })}
            placeholder='<div class="widget">...</div>'
            className="min-h-32 font-mono text-xs"
            rows={8}
          />
          <div className="flex items-start gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
            <ShieldAlertIcon className="size-3 shrink-0 mt-0.5" />
            <span>Custom HTML is sandboxed. Script tags are stripped for security.</span>
          </div>
        </div>
      )}

      {/* Aspect Ratio */}
      <div className="space-y-1.5">
        <Label className="text-xs">Aspect Ratio</Label>
        <Select
          value={config.aspectRatio}
          onValueChange={(value) => {
            if (value) onChange({ ...config, aspectRatio: value as EmbedConfig["aspectRatio"] });
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ar) => (
              <SelectItem key={ar.value} value={ar.value}>
                {ar.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Height (only when aspect ratio is auto) */}
      {config.aspectRatio === "auto" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Height</Label>
          <Select
            value={config.height}
            onValueChange={(value) => {
              if (value) onChange({ ...config, height: value as EmbedConfig["height"] });
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEIGHTS.map((h) => (
                <SelectItem key={h.value} value={h.value}>
                  {h.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {config.height === "custom" && (
            <Input
              type="number"
              value={config.customHeight}
              onChange={(e) => onChange({ ...config, customHeight: Math.max(100, parseInt(e.target.value) || 400) })}
              min={100}
              max={2000}
              className="mt-1.5"
            />
          )}
        </div>
      )}

      {/* Border Radius */}
      <div className="space-y-1.5">
        <Label className="text-xs">Corner Radius</Label>
        <Select
          value={config.borderRadius}
          onValueChange={(value) => {
            if (value) onChange({ ...config, borderRadius: value as EmbedConfig["borderRadius"] });
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label className="text-xs">Options</Label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={config.showBorder}
            onCheckedChange={(checked) =>
              onChange({ ...config, showBorder: checked === true })
            }
          />
          Show border
        </label>
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <Label className="text-xs">Caption</Label>
        <Input
          value={config.caption}
          onChange={(e) => onChange({ ...config, caption: e.target.value })}
          placeholder="Optional caption text"
        />
      </div>
    </div>
  );
}
