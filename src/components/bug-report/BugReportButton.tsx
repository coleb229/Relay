"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Bug } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const BugReportDialog = dynamic(
  () =>
    import("./BugReportDialog").then((mod) => ({
      default: mod.BugReportDialog,
    })),
  { ssr: false }
);

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
          className="relative inline-flex size-8 items-center justify-center rounded-lg text-sm transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground focus-visible:outline-none"
          onClick={() => setOpen(true)}
        >
          <Bug className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Report a Bug</TooltipContent>
      </Tooltip>

      {open && (
        <BugReportDialog open={open} onOpenChange={setOpen} user={user} />
      )}
    </>
  );
}
