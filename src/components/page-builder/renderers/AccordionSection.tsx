"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { z } from "zod";
import type { accordionConfigSchema } from "../schemas";

type AccordionConfig = z.infer<typeof accordionConfigSchema>;

interface AccordionSectionProps {
  config: AccordionConfig;
}

export function AccordionSection({ config }: AccordionSectionProps) {
  const { heading, items, allowMultiOpen } = config;
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenIndices((prev) => {
      const next = new Set(allowMultiOpen ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  if (!items.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Add items to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {heading && (
        <h3 className="text-xl font-semibold">{heading}</h3>
      )}
      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {items.map((item, index) => {
          const isOpen = openIndices.has(index);
          return (
            <div key={index}>
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left font-medium hover:bg-muted/50 transition-colors"
              >
                <span>{item.heading || `Item ${index + 1}`}</span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-4 pb-4">
                  {item.content ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">No content</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
