import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="default"
          size="lg"
          render={<a href={buttonLink || "#"} />}
          className="mt-8 h-11 px-8"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
