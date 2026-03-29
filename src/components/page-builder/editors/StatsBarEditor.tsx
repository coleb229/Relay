"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { statsBarConfigSchema } from "../schemas";

type StatsBarConfig = z.infer<typeof statsBarConfigSchema>;

interface StatsBarEditorProps {
  config: StatsBarConfig;
  onChange: (config: StatsBarConfig) => void;
}

export function StatsBarEditor({ config, onChange }: StatsBarEditorProps) {
  function updateItem(index: number, updates: Partial<StatsBarConfig["columns"][number]>) {
    const columns = [...config.columns];
    columns[index] = { ...columns[index], ...updates };
    onChange({ ...config, columns });
  }

  function addItem() {
    onChange({
      ...config,
      columns: [...config.columns, { value: "", label: "", prefix: "", suffix: "" }],
    });
  }

  function removeItem(index: number) {
    const columns = config.columns.filter((_, i) => i !== index);
    onChange({ ...config, columns });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="stats-heading">Heading (optional)</Label>
        <Input
          id="stats-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="By the Numbers"
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

      <div className="space-y-3">
        <Label>Stats</Label>
        {config.columns.map((col, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Stat {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeItem(index)}
                aria-label={`Remove stat ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Input
                value={col.prefix}
                onChange={(e) => updateItem(index, { prefix: e.target.value })}
                placeholder="$"
                className="w-14"
              />
              <Input
                value={col.value}
                onChange={(e) => updateItem(index, { value: e.target.value })}
                placeholder="500"
                className="flex-1"
              />
              <Input
                value={col.suffix}
                onChange={(e) => updateItem(index, { suffix: e.target.value })}
                placeholder="+"
                className="w-14"
              />
            </div>

            <Input
              value={col.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
              placeholder="Students"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Stat
        </Button>
      </div>
    </div>
  );
}
