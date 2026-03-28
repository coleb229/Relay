"use client";

import { useState } from "react";
import { Bug } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { BugReportDialog } from "./BugReportDialog";

interface Props {
  user: { name?: string | null; email?: string | null };
}

export function BugReportButton({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          aria-label="Report a bug"
          className="relative inline-flex size-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
          onClick={() => setOpen(true)}
        >
          <Bug className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Report a Bug</TooltipContent>
      </Tooltip>

      <BugReportDialog open={open} onOpenChange={setOpen} user={user} />
    </>
  );
}
