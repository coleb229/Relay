"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { faqAccordionConfigSchema } from "../schemas";

type FaqAccordionConfig = z.infer<typeof faqAccordionConfigSchema>;

interface FaqAccordionEditorProps {
  config: FaqAccordionConfig;
  onChange: (config: FaqAccordionConfig) => void;
}

export function FaqAccordionEditor({ config, onChange }: FaqAccordionEditorProps) {
  function updateItem(index: number, updates: Partial<FaqAccordionConfig["items"][number]>) {
    const items = [...config.items];
    items[index] = { ...items[index], ...updates };
    onChange({ ...config, items });
  }

  function addItem() {
    onChange({
      ...config,
      items: [...config.items, { question: "", answer: "" }],
    });
  }

  function removeItem(index: number) {
    const items = config.items.filter((_, i) => i !== index);
    onChange({ ...config, items });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="faq-heading">Heading</Label>
        <Input
          id="faq-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Frequently Asked Questions"
        />
      </div>

      <div className="space-y-3">
        <Label>Questions</Label>
        {config.items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Question {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeItem(index)}
                aria-label={`Remove question ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <Input
              value={item.question}
              onChange={(e) => updateItem(index, { question: e.target.value })}
              placeholder="Question"
            />

            <Textarea
              value={item.answer}
              onChange={(e) => updateItem(index, { answer: e.target.value })}
              rows={3}
              placeholder="Answer"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Question
        </Button>
      </div>
    </div>
  );
}
