import { FileText, Video, HelpCircle } from "lucide-react";

// ── Gradient fallback system ────────────────────────────────────────

export const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-blue-500 to-violet-600",
  "from-teal-500 to-emerald-600",
];

export function hashTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGradient(title: string): string {
  return GRADIENTS[hashTitle(title) % GRADIENTS.length];
}

// ── Lesson type maps ────────────────────────────────────────────────

export const LESSON_TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
  QUIZ: HelpCircle,
};

export const LESSON_TYPE_COLOR: Record<string, string> = {
  TEXT: "text-sky-600 dark:text-sky-400",
  VIDEO: "text-violet-600 dark:text-violet-400",
  QUIZ: "text-amber-600 dark:text-amber-400",
};

// ── Price formatting ────────────────────────────────────────────────

export function formatPrice(price: number | null): string {
  if (price == null || price <= 0) return "Free";
  return `$${price.toFixed(2)}`;
}

// ── Status config ───────────────────────────────────────────────────

export const STATUS_BADGE_VARIANT = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const;

export const STATUS_LABEL = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;
