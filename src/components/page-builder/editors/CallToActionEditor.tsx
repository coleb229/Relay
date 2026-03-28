"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CallToActionEditorProps {
  config: {
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundColor: string | null;
  };
  onChange: (config: CallToActionEditorProps["config"]) => void;
}

export function CallToActionEditor({ config, onChange }: CallToActionEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cta-heading">Heading</Label>
        <Input
          id="cta-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Ready to Get Started?"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cta-description">Description</Label>
        <Textarea
          id="cta-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          rows={3}
          placeholder="A compelling description..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cta-button-text">Button Text</Label>
        <Input
          id="cta-button-text"
          value={config.buttonText}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Enroll Now"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cta-button-link">Button Link</Label>
        <Input
          id="cta-button-link"
          value={config.buttonLink}
          onChange={(e) => onChange({ ...config, buttonLink: e.target.value })}
          placeholder="/enroll"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Background Color</Label>
        <div className="flex items-center gap-2">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            style={{ backgroundColor: config.backgroundColor ?? "transparent" }}
          />
          <Input
            value={config.backgroundColor ?? ""}
            onChange={(e) =>
              onChange({ ...config, backgroundColor: e.target.value || null })
            }
            placeholder="oklch(0.95 0 0) or #f5f5f5"
          />
        </div>
      </div>
    </div>
  );
}
