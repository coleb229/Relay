"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";

interface TestimonialItem {
  quote: string;
  authorName: string;
  authorAvatar: string | null;
}

interface TestimonialsEditorProps {
  config: {
    heading: string;
    items: TestimonialItem[];
  };
  onChange: (config: TestimonialsEditorProps["config"]) => void;
}

export function TestimonialsEditor({ config, onChange }: TestimonialsEditorProps) {
  function updateItem(index: number, updates: Partial<TestimonialItem>) {
    const items = [...config.items];
    items[index] = { ...items[index], ...updates };
    onChange({ ...config, items });
  }

  function addItem() {
    onChange({
      ...config,
      items: [
        ...config.items,
        { quote: "", authorName: "", authorAvatar: null },
      ],
    });
  }

  function removeItem(index: number) {
    const items = config.items.filter((_, i) => i !== index);
    onChange({ ...config, items });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="testimonials-heading">Heading</Label>
        <Input
          id="testimonials-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="What Students Say"
        />
      </div>

      <div className="space-y-3">
        <Label>Testimonials</Label>
        {config.items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Testimonial {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeItem(index)}
                aria-label={`Remove testimonial ${index + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <Textarea
              value={item.quote}
              onChange={(e) => updateItem(index, { quote: e.target.value })}
              rows={3}
              placeholder="Student testimonial..."
            />

            <Input
              value={item.authorName}
              onChange={(e) => updateItem(index, { authorName: e.target.value })}
              placeholder="Author name"
            />

            <ImageUploadField
              label="Avatar"
              value={item.authorAvatar}
              onChange={(url) => updateItem(index, { authorAvatar: url })}
              placeholder="Avatar URL (optional)"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <PlusIcon className="size-3.5" />
          Add Testimonial
        </Button>
      </div>
    </div>
  );
}
