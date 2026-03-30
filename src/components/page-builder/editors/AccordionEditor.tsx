"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { accordionConfigSchema } from "../schemas";

type AccordionConfig = z.infer<typeof accordionConfigSchema>;

interface AccordionEditorProps {
  config: AccordionConfig;
  onChange: (config: AccordionConfig) => void;
}

export function AccordionEditor({ config, onChange }: AccordionEditorProps) {
  function updateItem(index: number, updates: Partial<AccordionConfig["items"][number]>) {
    const items = [...config.items];
    items[index] = { ...items[index], ...updates };
    onChange({ ...config, items });
  }

  function addItem() {
    onChange({
      ...config,
      items: [...config.items, { heading: "", content: "" }],
    });
  }

  function removeItem(index: number) {
    onChange({ ...config, items: config.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="accordion-heading">Heading</Label>
        <Input
          id="accordion-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Optional heading"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="accordion-multi"
          checked={config.allowMultiOpen}
          onCheckedChange={(checked) =>
            onChange({ ...config, allowMultiOpen: !!checked })
          }
        />
        <Label htmlFor="accordion-multi" className="cursor-pointer">
          Allow multiple items open
        </Label>
      </div>

      <div className="space-y-3">
        <Label>Items</Label>
        {config.items.map((item, index) => (
          <div key={index} className="rounded-lg border border-input p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Item {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeItem(index)}
                aria-label={`Remove item ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>
            <Input
              value={item.heading}
              onChange={(e) => updateItem(index, { heading: e.target.value })}
              placeholder="Item heading"
            />
            <Textarea
              value={item.content}
              onChange={(e) => updateItem(index, { content: e.target.value })}
              rows={3}
              placeholder="HTML content..."
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
