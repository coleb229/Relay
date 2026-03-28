"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface HeroEditorProps {
  config: {
    title: string;
    subtitle: string;
    backgroundImageUrl: string | null;
    ctaText: string;
    ctaLink: string;
    overlayOpacity: number;
  };
  onChange: (config: HeroEditorProps["config"]) => void;
}

export function HeroEditor({ config, onChange }: HeroEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="hero-title">Title</Label>
        <Input
          id="hero-title"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Course title"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-subtitle">Subtitle</Label>
        <Textarea
          id="hero-subtitle"
          value={config.subtitle}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          rows={2}
          placeholder="A short description..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-bg-image">Background Image URL</Label>
        <Input
          id="hero-bg-image"
          value={config.backgroundImageUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, backgroundImageUrl: e.target.value || null })
          }
          placeholder="https://example.com/hero.jpg"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-cta-text">CTA Text</Label>
        <Input
          id="hero-cta-text"
          value={config.ctaText}
          onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
          placeholder="Enroll Now"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-cta-link">CTA Link</Label>
        <Input
          id="hero-cta-link"
          value={config.ctaLink}
          onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
          placeholder="/enroll"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-overlay">Overlay Opacity</Label>
        <Input
          id="hero-overlay"
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={config.overlayOpacity}
          onChange={(e) =>
            onChange({ ...config, overlayOpacity: parseFloat(e.target.value) || 0 })
          }
        />
      </div>
    </div>
  );
}
