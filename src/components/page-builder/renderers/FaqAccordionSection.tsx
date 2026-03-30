"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { FaqAccordionSection as FaqAccordionSectionType } from "../schemas";

interface FaqAccordionSectionProps {
  config: FaqAccordionSectionType["config"];
}

export function FaqAccordionSection({ config }: FaqAccordionSectionProps) {
  const { heading, items } = config;
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  if (!items || items.length === 0) return null;

  function toggle(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className="divide-y divide-border">
        {items.map((item, i) => {
          const isOpen = openItems.has(i);
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-base font-medium">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart)",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-(--dur-state) ease-(--ease-out-quart)",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
