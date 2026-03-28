import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Heart,
  Globe,
  Code,
  Music,
  Camera,
  Palette,
  Layers,
  Brain,
  Trophy,
  Compass,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  PlayCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { FeaturesGridSection as FeaturesGridSectionType } from "../schemas";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Clock,
  Star,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Heart,
  Globe,
  Code,
  Music,
  Camera,
  Palette,
  Layers,
  Brain,
  Trophy,
  Compass,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  PlayCircle,
  FileText,
};

interface FeaturesGridSectionProps {
  config: FeaturesGridSectionType["config"];
}

export function FeaturesGridSection({ config }: FeaturesGridSectionProps) {
  const { heading, columnCount, columns } = config;

  const gridColsClass = cn(
    "grid grid-cols-1 gap-6 sm:grid-cols-2",
    columnCount === 2 && "lg:grid-cols-2",
    columnCount === 3 && "lg:grid-cols-3",
    columnCount === 4 && "lg:grid-cols-4"
  );

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      {columns.length > 0 && (
        <div className={gridColsClass}>
          {columns.map((col, i) => {
            const Icon = ICON_MAP[col.icon] ?? BookOpen;
            return (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                {col.heading && (
                  <h3 className="mb-1.5 text-base font-semibold">
                    {col.heading}
                  </h3>
                )}
                {col.text && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {col.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
