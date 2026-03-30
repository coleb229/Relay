"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { z } from "zod";
import type { tabsConfigSchema } from "../schemas";

type TabsConfig = z.infer<typeof tabsConfigSchema>;

interface TabsSectionProps {
  config: TabsConfig;
}

export function TabsSection({ config }: TabsSectionProps) {
  const { heading, tabs } = config;
  const [activeIndex, setActiveIndex] = useState(0);

  if (!tabs.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Add tabs to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {heading && (
        <h3 className="text-xl font-semibold">{heading}</h3>
      )}
      <div className="border-b border-border">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px",
                activeIndex === index
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label || `Tab ${index + 1}`}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-2">
        {tabs[activeIndex]?.html ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: tabs[activeIndex].html }}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No content in this tab</p>
        )}
      </div>
    </div>
  );
}
