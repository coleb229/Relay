"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleNavGroupProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleNavGroup({
  label,
  isExpanded,
  onToggle,
  children,
}: CollapsibleNavGroupProps) {
  return (
    <Collapsible.Root open={isExpanded} onOpenChange={onToggle}>
      <Collapsible.Trigger
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5",
          "text-[11px] font-semibold uppercase tracking-wider",
          "text-sidebar-foreground/50 hover:text-sidebar-foreground/70",
          "hover:bg-sidebar-accent/40 transition-colors duration-150",
          "cursor-pointer select-none",
          "group-data-[collapsible=icon]:hidden"
        )}
      >
        <span>{label}</span>
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-sidebar-foreground/30 transition-transform duration-(--dur-state) ease-(--ease-out-quart)",
            isExpanded && "rotate-90"
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Panel
        keepMounted
        data-sidebar="collapsible-panel"
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
