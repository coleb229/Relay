"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusIcon, TrashIcon } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";
import { IconPicker } from "./IconPicker";

interface Column {
  imageUrl: string | null;
  icon: string;
  heading: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

interface MultiColumnEditorProps {
  config: {
    heading: string;
    subheading: string;
    columnCount: 2 | 3 | 4;
    gap: "sm" | "md" | "lg";
    verticalAlign: "top" | "center" | "bottom";
    equalHeight: boolean;
    columns: Column[];
  };
  onChange: (config: MultiColumnEditorProps["config"]) => void;
}

export function MultiColumnEditor({ config, onChange }: MultiColumnEditorProps) {
  function updateColumn(index: number, updates: Partial<Column>) {
    const columns = [...config.columns];
    columns[index] = { ...columns[index], ...updates };
    onChange({ ...config, columns });
  }

  function addColumn() {
    onChange({
      ...config,
      columns: [
        ...config.columns,
        { imageUrl: null, icon: "", heading: "", text: "", buttonText: "", buttonLink: "" },
      ],
    });
  }

  function removeColumn(index: number) {
    const columns = config.columns.filter((_, i) => i !== index);
    onChange({ ...config, columns });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="mc-heading">Heading</Label>
        <Input
          id="mc-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Section heading"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mc-subheading">Subheading</Label>
        <Input
          id="mc-subheading"
          value={config.subheading}
          onChange={(e) => onChange({ ...config, subheading: e.target.value })}
          placeholder="Section subheading"
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

      <div className="space-y-1.5">
        <Label>Gap</Label>
        <ToggleGroup
          value={[config.gap]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, gap: values[0] as "sm" | "md" | "lg" });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="sm">SM</ToggleGroupItem>
          <ToggleGroupItem value="md">MD</ToggleGroupItem>
          <ToggleGroupItem value="lg">LG</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label>Vertical Alignment</Label>
        <ToggleGroup
          value={[config.verticalAlign]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({ ...config, verticalAlign: values[0] as "top" | "center" | "bottom" });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="top">Top</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="mc-equal-height"
          checked={config.equalHeight}
          onCheckedChange={(checked) => onChange({ ...config, equalHeight: checked })}
        />
        <Label htmlFor="mc-equal-height">Equal Height Columns</Label>
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

            <ImageUploadField
              label="Image"
              value={col.imageUrl}
              onChange={(url) => updateColumn(index, { imageUrl: url })}
            />

            <div className="flex items-start gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Icon</Label>
                <IconPicker
                  value={col.icon}
                  onSelect={(icon) => updateColumn(index, { icon })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Heading</Label>
                  <Input
                    value={col.heading}
                    onChange={(e) => updateColumn(index, { heading: e.target.value })}
                    placeholder="Column heading"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Text</Label>
                  <Textarea
                    value={col.text}
                    onChange={(e) => updateColumn(index, { text: e.target.value })}
                    rows={3}
                    placeholder="Column text"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={col.buttonText}
                  onChange={(e) => updateColumn(index, { buttonText: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Button Link</Label>
                <Input
                  value={col.buttonLink}
                  onChange={(e) => updateColumn(index, { buttonLink: e.target.value })}
                  placeholder="https://..."
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
