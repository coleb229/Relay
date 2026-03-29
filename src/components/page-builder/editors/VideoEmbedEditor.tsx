"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { videoEmbedConfigSchema } from "../schemas";

type VideoEmbedConfig = z.infer<typeof videoEmbedConfigSchema>;

interface VideoEmbedEditorProps {
  config: VideoEmbedConfig;
  onChange: (config: VideoEmbedConfig) => void;
}

function detectProvider(url: string): VideoEmbedConfig["provider"] {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  return "custom";
}

const ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
] as const;

const MAX_WIDTH_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "full", label: "Full" },
] as const;

export function VideoEmbedEditor({ config, onChange }: VideoEmbedEditorProps) {
  function handleUrlChange(url: string) {
    const provider = detectProvider(url);
    onChange({ ...config, videoUrl: url, provider });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="video-heading">Heading (optional)</Label>
        <Input
          id="video-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Watch the intro"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          value={config.videoUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {config.provider && (
          <p className="text-xs text-muted-foreground">
            Detected provider: <span className="font-medium capitalize">{config.provider}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Aspect Ratio</Label>
        <ToggleGroup
          value={[config.aspectRatio]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                aspectRatio: values[0] as VideoEmbedConfig["aspectRatio"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          {ASPECT_RATIO_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Aspect ratio ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label>Max Width</Label>
        <ToggleGroup
          value={[config.maxWidth]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                maxWidth: values[0] as VideoEmbedConfig["maxWidth"],
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
