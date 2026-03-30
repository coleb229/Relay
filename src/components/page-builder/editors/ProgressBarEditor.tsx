"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusIcon, TrashIcon } from "lucide-react";

interface BarItem {
  label: string;
  value: number;
  color: string | null;
}

interface ProgressBarConfig {
  heading: string;
  bars: BarItem[];
  showPercentage: boolean;
  animate: boolean;
  height: "sm" | "md" | "lg";
  borderRadius: "none" | "sm" | "full";
}

interface ProgressBarEditorProps {
  config: ProgressBarConfig;
  onChange: (config: ProgressBarConfig) => void;
}

export function ProgressBarEditor({ config, onChange }: ProgressBarEditorProps) {
  function updateBar(index: number, updates: Partial<BarItem>) {
    const bars = [...config.bars];
    bars[index] = { ...bars[index], ...updates };
    onChange({ ...config, bars });
  }

  function addBar() {
    onChange({
      ...config,
      bars: [...config.bars, { label: "", value: 50, color: null }],
    });
  }

  function removeBar(index: number) {
    onChange({ ...config, bars: config.bars.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-1.5">
        <Label htmlFor="pb-heading">Heading</Label>
        <Input
          id="pb-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Skills & Expertise"
        />
      </div>

      {/* Height */}
      <div className="space-y-1.5">
        <Label>Bar Height</Label>
        <ToggleGroup
          value={[config.height]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, height: values[0] as ProgressBarConfig["height"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="sm">Thin</ToggleGroupItem>
          <ToggleGroupItem value="md">Medium</ToggleGroupItem>
          <ToggleGroupItem value="lg">Thick</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Border Radius */}
      <div className="space-y-1.5">
        <Label>Corners</Label>
        <ToggleGroup
          value={[config.borderRadius]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, borderRadius: values[0] as ProgressBarConfig["borderRadius"] });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="none">Square</ToggleGroupItem>
          <ToggleGroupItem value="sm">Rounded</ToggleGroupItem>
          <ToggleGroupItem value="full">Pill</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Show percentage */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="pb-show-pct"
          checked={config.showPercentage}
          onCheckedChange={(checked) =>
            onChange({ ...config, showPercentage: checked === true })
          }
        />
        <Label htmlFor="pb-show-pct" className="text-xs">
          Show percentage
        </Label>
      </div>

      {/* Animate */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="pb-animate"
          checked={config.animate}
          onCheckedChange={(checked) =>
            onChange({ ...config, animate: checked === true })
          }
        />
        <Label htmlFor="pb-animate" className="text-xs">
          Animate on scroll
        </Label>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        <Label>Bars</Label>

        {config.bars.map((bar, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Bar {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeBar(index)}
                aria-label={`Remove bar ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <Input
              value={bar.label}
              onChange={(e) => updateBar(index, { label: e.target.value })}
              placeholder="Label (e.g. JavaScript)"
            />

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={bar.value}
                onChange={(e) =>
                  updateBar(index, {
                    value: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">%</span>
              <div className="flex-1" />
              <Label htmlFor={`pb-bar-color-${index}`} className="text-xs">
                Color
              </Label>
              <input
                id={`pb-bar-color-${index}`}
                type="color"
                value={bar.color || "#7c3aed"}
                onChange={(e) => updateBar(index, { color: e.target.value })}
                className="size-7 cursor-pointer rounded border border-input bg-background"
              />
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addBar}
          className="w-full"
        >
          <PlusIcon className="size-3.5" />
          Add Bar
        </Button>
      </div>
    </div>
  );
}
