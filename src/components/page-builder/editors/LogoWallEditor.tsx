"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { logoWallConfigSchema } from "../schemas";
import { ImageUploadField } from "./ImageUploadField";

type LogoWallConfig = z.infer<typeof logoWallConfigSchema>;

interface LogoWallEditorProps {
  config: LogoWallConfig;
  onChange: (config: LogoWallConfig) => void;
}

const LOGO_HEIGHT_OPTIONS = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
] as const;

export function LogoWallEditor({ config, onChange }: LogoWallEditorProps) {
  function updateLogo(index: number, updates: Partial<LogoWallConfig["logos"][number]>) {
    const logos = [...config.logos];
    logos[index] = { ...logos[index], ...updates };
    onChange({ ...config, logos });
  }

  function addLogo() {
    onChange({
      ...config,
      logos: [...config.logos, { imageUrl: "", alt: "", link: null }],
    });
  }

  function removeLogo(index: number) {
    const logos = config.logos.filter((_, i) => i !== index);
    onChange({ ...config, logos });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="logo-heading">Heading</Label>
        <Input
          id="logo-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Trusted By"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="logo-grayscale"
          checked={config.grayscale}
          onCheckedChange={(checked) =>
            onChange({ ...config, grayscale: checked })
          }
        />
        <Label htmlFor="logo-grayscale" className="cursor-pointer">
          Grayscale logos
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label>Max Logo Height</Label>
        <ToggleGroup
          value={[config.maxLogoHeight]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                maxLogoHeight: values[0] as LogoWallConfig["maxLogoHeight"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          {LOGO_HEIGHT_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`Max height ${opt.label}`}>
              <span className="text-xs font-medium">{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-3">
        <Label>Logos</Label>
        {config.logos.map((logo, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Logo {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeLogo(index)}
                aria-label={`Remove logo ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <ImageUploadField
              label="Logo Image"
              value={logo.imageUrl || null}
              onChange={(url) => updateLogo(index, { imageUrl: url ?? "" })}
            />

            <Input
              value={logo.alt}
              onChange={(e) => updateLogo(index, { alt: e.target.value })}
              placeholder="Alt text"
            />

            <Input
              value={logo.link ?? ""}
              onChange={(e) =>
                updateLogo(index, { link: e.target.value || null })
              }
              placeholder="Link URL (optional)"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addLogo} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Logo
        </Button>
      </div>
    </div>
  );
}
