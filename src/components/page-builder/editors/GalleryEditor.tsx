"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { galleryConfigSchema } from "../schemas";
import { ImageUploadField } from "./ImageUploadField";

type GalleryConfig = z.infer<typeof galleryConfigSchema>;

interface GalleryEditorProps {
  config: GalleryConfig;
  onChange: (config: GalleryConfig) => void;
}

const MODE_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "carousel", label: "Carousel" },
] as const;

const COLUMN_OPTIONS = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const;

const ASPECT_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "auto", label: "Auto" },
] as const;

const GAP_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
] as const;

export function GalleryEditor({ config, onChange }: GalleryEditorProps) {
  function updateImage(index: number, updates: Partial<GalleryConfig["images"][number]>) {
    const images = [...config.images];
    images[index] = { ...images[index], ...updates };
    onChange({ ...config, images });
  }

  function addImage() {
    onChange({
      ...config,
      images: [...config.images, { imageUrl: "", alt: "", caption: "" }],
    });
  }

  function removeImage(index: number) {
    const images = config.images.filter((_, i) => i !== index);
    onChange({ ...config, images });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="gallery-heading">Heading</Label>
        <Input
          id="gallery-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Gallery"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Display Mode</Label>
        <ToggleGroup
          value={[config.mode]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, mode: values[0] as GalleryConfig["mode"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {MODE_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {config.mode === "grid" && (
        <div className="space-y-1.5">
          <Label>Columns</Label>
          <ToggleGroup
            value={[String(config.columnCount)]}
            onValueChange={(values) => {
              if (values.length > 0) {
                onChange({ ...config, columnCount: Number(values[0]) as 2 | 3 | 4 });
              }
            }}
            variant="outline"
            size="sm"
          >
            {COLUMN_OPTIONS.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`${opt.label} columns`}>
                <span className="text-xs font-medium">{opt.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Aspect Ratio</Label>
        <ToggleGroup
          value={[config.aspectRatio]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, aspectRatio: values[0] as GalleryConfig["aspectRatio"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {ASPECT_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label>Gap</Label>
        <ToggleGroup
          value={[config.gap]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, gap: values[0] as GalleryConfig["gap"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          {GAP_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Gap ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {config.mode === "carousel" && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox
              id="gallery-autoplay"
              checked={config.autoplay}
              onCheckedChange={(checked) =>
                onChange({ ...config, autoplay: checked })
              }
            />
            <Label htmlFor="gallery-autoplay" className="cursor-pointer">
              Autoplay
            </Label>
          </div>

          {config.autoplay && (
            <div className="space-y-1.5">
              <Label htmlFor="gallery-interval">Interval (seconds)</Label>
              <Input
                id="gallery-interval"
                type="number"
                min={1}
                max={30}
                value={config.autoplayInterval}
                onChange={(e) =>
                  onChange({ ...config, autoplayInterval: Number(e.target.value) || 5 })
                }
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-3">
        <Label>Images</Label>
        {config.images.map((image, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-input p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Image {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <ImageUploadField
              label="Image"
              value={image.imageUrl || null}
              onChange={(url) => updateImage(index, { imageUrl: url ?? "" })}
            />

            <Input
              value={image.alt}
              onChange={(e) => updateImage(index, { alt: e.target.value })}
              placeholder="Alt text"
            />

            <Input
              value={image.caption}
              onChange={(e) => updateImage(index, { caption: e.target.value })}
              placeholder="Caption (optional)"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addImage} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Image
        </Button>
      </div>
    </div>
  );
}
