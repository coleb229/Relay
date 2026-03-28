import { cn } from "@/lib/utils";
import type { CallToActionSection as CallToActionSectionType } from "../schemas";

interface CallToActionSectionProps {
  config: CallToActionSectionType["config"];
}

export function CallToActionSection({ config }: CallToActionSectionProps) {
  const { heading, description, buttonText, buttonLink, backgroundColor } = config;

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl rounded-2xl px-8 py-12 text-center",
        !backgroundColor && "bg-primary/5 dark:bg-primary/10"
      )}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {heading && (
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
      )}
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {description}
        </p>
      )}
      {buttonText && (
        <a
          href={buttonLink || "#"}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] active:shadow-sm"
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}
