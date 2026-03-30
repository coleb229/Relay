"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ImageUploadField } from "./ImageUploadField";

interface ImageBlockEditorProps {
  config: {
    imageUrl: string;
    caption: string;
    maxWidth: "sm" | "md" | "lg" | "full";
  };
  onChange: (config: ImageBlockEditorProps["config"]) => void;
}

const MAX_WIDTH_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "full", label: "Full" },
] as const;

export function ImageBlockEditor({ config, onChange }: ImageBlockEditorProps) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Image"
        value={config.imageUrl || null}
        onChange={(url) => onChange({ ...config, imageUrl: url ?? "" })}
      />

      <div className="space-y-1.5">
        <Label htmlFor="image-caption">Caption</Label>
        <Input
          id="image-caption"
          value={config.caption}
          onChange={(e) => onChange({ ...config, caption: e.target.value })}
          placeholder="Image caption"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Max Width</Label>
        <ToggleGroup
          value={[config.maxWidth]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                maxWidth: values[0] as ImageBlockEditorProps["config"]["maxWidth"],
              });
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
    </div>
  );
}
