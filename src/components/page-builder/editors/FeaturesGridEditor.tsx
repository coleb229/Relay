"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Heart,
  Globe,
  Code,
  Music,
  Camera,
  Palette,
  Layers,
  Brain,
  Trophy,
  Compass,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  PlayCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";

const AVAILABLE_ICONS = [
  "BookOpen",
  "Users",
  "Clock",
  "Star",
  "Zap",
  "Target",
  "Lightbulb",
  "Rocket",
  "Shield",
  "Award",
  "Heart",
  "Globe",
  "Code",
  "Music",
  "Camera",
  "Palette",
  "Layers",
  "Brain",
  "Trophy",
  "Compass",
  "CheckCircle2",
  "Sparkles",
  "GraduationCap",
  "PlayCircle",
  "FileText",
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Clock,
  Star,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Heart,
  Globe,
  Code,
  Music,
  Camera,
  Palette,
  Layers,
  Brain,
  Trophy,
  Compass,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  PlayCircle,
  FileText,
};

interface Column {
  icon: string;
  heading: string;
  text: string;
}

interface FeaturesGridEditorProps {
  config: {
    heading: string;
    columnCount: 2 | 3 | 4;
    columns: Column[];
  };
  onChange: (config: FeaturesGridEditorProps["config"]) => void;
}

function IconPickerButton({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const IconComponent = ICON_MAP[value] ?? BookOpen;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex size-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors"
        aria-label="Pick icon"
      >
        <IconComponent className="size-4" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-56 p-2">
        <div className="grid grid-cols-5 gap-1">
          {AVAILABLE_ICONS.map((name) => {
            const Icon = ICON_MAP[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelect(name);
                  setOpen(false);
                }}
                className="flex size-8 items-center justify-center rounded-md hover:bg-muted transition-colors data-[active]:bg-primary/10"
                data-active={value === name ? "" : undefined}
                title={name}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FeaturesGridEditor({ config, onChange }: FeaturesGridEditorProps) {
  function updateColumn(index: number, updates: Partial<Column>) {
    const columns = [...config.columns];
    columns[index] = { ...columns[index], ...updates };
    onChange({ ...config, columns });
  }

  function addColumn() {
    onChange({
      ...config,
      columns: [...config.columns, { icon: "BookOpen", heading: "", text: "" }],
    });
  }

  function removeColumn(index: number) {
    const columns = config.columns.filter((_, i) => i !== index);
    onChange({ ...config, columns });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="features-heading">Heading</Label>
        <Input
          id="features-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="What You'll Learn"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Column Count</Label>
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
          <ToggleGroupItem value="2">2</ToggleGroupItem>
          <ToggleGroupItem value="3">3</ToggleGroupItem>
          <ToggleGroupItem value="4">4</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Columns list */}
      <div className="space-y-3">
        <Label>Columns</Label>
        {config.columns.map((col, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Column {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeColumn(index)}
                aria-label={`Remove column ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <div className="flex items-start gap-2">
              <IconPickerButton
                value={col.icon}
                onSelect={(icon) => updateColumn(index, { icon })}
              />
              <div className="flex-1 space-y-2">
                <Input
                  value={col.heading}
                  onChange={(e) =>
                    updateColumn(index, { heading: e.target.value })
                  }
                  placeholder="Feature heading"
                />
                <Textarea
                  value={col.text}
                  onChange={(e) =>
                    updateColumn(index, { text: e.target.value })
                  }
                  rows={2}
                  placeholder="Feature description"
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addColumn} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Column
        </Button>
      </div>
    </div>
  );
}
