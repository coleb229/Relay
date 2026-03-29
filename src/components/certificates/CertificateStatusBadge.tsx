"use client";

import { cn } from "@/lib/utils";

type CertificateStatus = "active" | "expired" | "revoked";

interface CertificateStatusBadgeProps {
  expiresAt?: string | Date | null;
  revokedAt?: string | Date | null;
  className?: string;
}

function getStatus(expiresAt?: string | Date | null, revokedAt?: string | Date | null): CertificateStatus {
  if (revokedAt) return "revoked";
  if (expiresAt && new Date(expiresAt) < new Date()) return "expired";
  return "active";
}

const statusConfig: Record<CertificateStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/25",
  },
  expired: {
    label: "Expired",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/25",
  },
  revoked: {
    label: "Revoked",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 ring-red-500/25",
  },
};

export function CertificateStatusBadge({ expiresAt, revokedAt, className }: CertificateStatusBadgeProps) {
  const status = getStatus(expiresAt, revokedAt);
  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", config.className, className)}>
      {config.label}
    </span>
  );
}

export function TemplateStatusBadge({ status, className }: { status: string; className?: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: {
      label: "Draft",
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/25",
    },
    ACTIVE: {
      label: "Active",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/25",
    },
    ARCHIVED: {
      label: "Archived",
      className: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 ring-zinc-500/25",
    },
  };

  const c = config[status] ?? config.DRAFT;

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", c.className, className)}>
      {c.label}
    </span>
  );
}
