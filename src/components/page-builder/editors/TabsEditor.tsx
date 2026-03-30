"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { tabsConfigSchema } from "../schemas";

type TabsConfig = z.infer<typeof tabsConfigSchema>;

interface TabsEditorProps {
  config: TabsConfig;
  onChange: (config: TabsConfig) => void;
}

export function TabsEditor({ config, onChange }: TabsEditorProps) {
  function updateTab(index: number, updates: Partial<TabsConfig["tabs"][number]>) {
    const tabs = [...config.tabs];
    tabs[index] = { ...tabs[index], ...updates };
    onChange({ ...config, tabs });
  }

  function addTab() {
    onChange({
      ...config,
      tabs: [...config.tabs, { label: "", html: "" }],
    });
  }

  function removeTab(index: number) {
    onChange({ ...config, tabs: config.tabs.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tabs-heading">Heading</Label>
        <Input
          id="tabs-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Optional heading"
        />
      </div>

      <div className="space-y-3">
        <Label>Tabs</Label>
        {config.tabs.map((tab, index) => (
          <div key={index} className="rounded-lg border border-input p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Tab {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeTab(index)}
                aria-label={`Remove tab ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>
            <Input
              value={tab.label}
              onChange={(e) => updateTab(index, { label: e.target.value })}
              placeholder="Tab label"
            />
            <Textarea
              value={tab.html}
              onChange={(e) => updateTab(index, { html: e.target.value })}
              rows={4}
              placeholder="HTML content..."
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addTab} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Tab
        </Button>
      </div>
    </div>
  );
}
