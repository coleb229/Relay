"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { z } from "zod";
import type { mapConfigSchema } from "../schemas";

type MapConfig = z.infer<typeof mapConfigSchema>;

interface MapEditorProps {
  config: MapConfig;
  onChange: (config: MapConfig) => void;
}

export function MapEditor({ config, onChange }: MapEditorProps) {
  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Optional heading"
        />
      </div>

      {/* Embed URL */}
      <div className="space-y-1.5">
        <Label className="text-xs">Map Embed URL</Label>
        <Textarea
          value={config.embedUrl}
          onChange={(e) => onChange({ ...config, embedUrl: e.target.value })}
          placeholder='Paste Google Maps embed URL or full <iframe> code...'
          className="min-h-20 font-mono text-xs"
          rows={3}
        />
        <p className="text-[10px] text-muted-foreground">
          Google Maps → Share → Embed a map → Copy the iframe code or URL
        </p>
      </div>

      {/* Height */}
      <div className="space-y-1.5">
        <Label className="text-xs">Height</Label>
        <ToggleGroup
          value={[config.height]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({
                ...config,
                height: values[values.length - 1] as MapConfig["height"],
              });
          }}
        >
          <ToggleGroupItem value="sm">Small</ToggleGroupItem>
          <ToggleGroupItem value="md">Medium</ToggleGroupItem>
          <ToggleGroupItem value="lg">Large</ToggleGroupItem>
          <ToggleGroupItem value="xl">XL</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Border Radius */}
      <div className="space-y-1.5">
        <Label className="text-xs">Corner Radius</Label>
        <ToggleGroup
          value={[config.borderRadius]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({
                ...config,
                borderRadius: values[values.length - 1] as MapConfig["borderRadius"],
              });
          }}
        >
          <ToggleGroupItem value="none">None</ToggleGroupItem>
          <ToggleGroupItem value="sm">SM</ToggleGroupItem>
          <ToggleGroupItem value="md">MD</ToggleGroupItem>
          <ToggleGroupItem value="lg">LG</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <Label className="text-xs">Caption</Label>
        <Input
          value={config.caption}
          onChange={(e) => onChange({ ...config, caption: e.target.value })}
          placeholder="Optional caption below the map"
        />
      </div>
    </div>
  );
}
