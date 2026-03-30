import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import type { TestimonialsSection as TestimonialsSectionType } from "../schemas";

interface TestimonialsSectionProps {
  config: TestimonialsSectionType["config"];
}

export function TestimonialsSection({ config }: TestimonialsSectionProps) {
  const { heading, items } = config;

  if (!items || items.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-border bg-card p-6 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:border-primary/20"
          >
            <Quote className="mb-3 size-5 text-accent/50" />
            <blockquote className="text-sm italic leading-relaxed text-muted-foreground">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              {item.authorAvatar ? (
                <img
                  src={item.authorAvatar}
                  alt={item.authorName}
                  className="size-9 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-border">
                  {item.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{item.authorName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
