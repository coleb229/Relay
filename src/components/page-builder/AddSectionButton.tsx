"use client";

import { useState } from "react";
import {
  ImageIcon,
  LayoutGrid,
  FileText,
  Image,
  User,
  BookOpen,
  MousePointerClick,
  MessageSquareQuote,
  HelpCircle,
  PlayCircle,
  BarChart3,
  CreditCard,
  Building2,
  Minus,
  PlusIcon,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SECTION_TYPES, SECTION_LABELS, SECTION_ICONS, type SectionType } from "./schemas";

interface AddSectionButtonProps {
  position: number;
  onAdd: (type: SectionType, position: number) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ImageIcon,
  LayoutGrid,
  FileText,
  Image,
  User,
  BookOpen,
  MousePointerClick,
  MessageSquareQuote,
  HelpCircle,
  PlayCircle,
  BarChart3,
  CreditCard,
  Building2,
  Minus,
};

export function AddSectionButton({ position, onAdd }: AddSectionButtonProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(type: SectionType) {
    onAdd(type, position);
    setOpen(false);
  }

  return (
    <div className="group/add relative h-8 flex items-center justify-center">
      {/* Dashed line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-border/50 opacity-0 group-hover/add:opacity-100 transition-opacity" />

      {/* Plus button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              className={cn(
                "relative z-10 flex items-center justify-center size-6 rounded-full border bg-background text-muted-foreground shadow-sm transition-all",
                "opacity-0 group-hover/add:opacity-100 hover:bg-primary hover:text-primary-foreground hover:border-primary",
                open && "opacity-100 bg-primary text-primary-foreground border-primary"
              )}
            />
          }
        >
          <PlusIcon className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" className="w-64 p-2">
          <p className="text-xs font-medium text-muted-foreground px-2 pb-1.5">
            Add section
          </p>
          <div className="grid grid-cols-2 gap-1">
            {SECTION_TYPES.map((type) => {
              const IconComp = ICON_MAP[SECTION_ICONS[type]];
              return (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left"
                >
                  {IconComp && (
                    <IconComp className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{SECTION_LABELS[type]}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
