"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  SECTION_TYPES,
  SECTION_LABELS,
  SECTION_ICONS,
  SECTION_CATEGORY_ORDER,
  SECTION_CATEGORY_LABELS,
  SECTION_CATEGORY_MAP,
  type SectionType,
} from "./schemas";
import { SECTION_ICON_MAP } from "./section-icon-map";

interface AddSectionButtonProps {
  position: number;
  onAdd: (type: SectionType, position: number) => void;
}

export function AddSectionButton({ position, onAdd }: AddSectionButtonProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(type: SectionType) {
    onAdd(type, position);
    setOpen(false);
  }

  return (
    <div className="group/add relative h-8 flex items-center justify-center">
      {/* Dashed line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-border/50 opacity-0 group-hover/add:opacity-100 transition-opacity duration-(--dur-feedback) ease-(--ease-out-quart)" />

      {/* Plus button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              className={cn(
                "relative z-10 flex items-center justify-center size-6 rounded-full border bg-background text-muted-foreground shadow-sm transition-all duration-(--dur-feedback) ease-(--ease-out-quart)",
                "opacity-0 group-hover/add:opacity-100 hover:bg-primary hover:text-primary-foreground hover:border-primary",
                open && "opacity-100 bg-primary text-primary-foreground border-primary"
              )}
            />
          }
        >
          <PlusIcon className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="center" className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search sections..." />
            <CommandList>
              <CommandEmpty>No sections found</CommandEmpty>
              {SECTION_CATEGORY_ORDER.map((category) => {
                const types = SECTION_TYPES.filter(
                  (t) => SECTION_CATEGORY_MAP[t] === category
                );
                return (
                  <CommandGroup
                    key={category}
                    heading={SECTION_CATEGORY_LABELS[category]}
                  >
                    {types.map((type) => {
                      const IconComp = SECTION_ICON_MAP[SECTION_ICONS[type]];
                      return (
                        <CommandItem
                          key={type}
                          onSelect={() => handleSelect(type)}
                        >
                          {IconComp && (
                            <IconComp className="size-4 text-muted-foreground" />
                          )}
                          <span>{SECTION_LABELS[type]}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
