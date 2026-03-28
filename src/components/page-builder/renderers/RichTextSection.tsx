import { cn } from "@/lib/utils";
import type { RichTextSection as RichTextSectionType } from "../schemas";

interface RichTextSectionProps {
  config: RichTextSectionType["config"];
}

export function RichTextSection({ config }: RichTextSectionProps) {
  const { html } = config;

  if (!html) return null;

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div
        className={cn(
          // Prose-like typography styles
          "[&>h1]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:tracking-tight",
          "[&>h2]:mb-3 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:tracking-tight",
          "[&>h3]:mb-2 [&>h3]:mt-6 [&>h3]:text-xl [&>h3]:font-semibold",
          "[&>h4]:mb-2 [&>h4]:mt-4 [&>h4]:text-lg [&>h4]:font-medium",
          "[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-muted-foreground",
          "[&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-muted-foreground",
          "[&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:text-muted-foreground",
          "[&_li]:mb-1 [&_li]:leading-relaxed",
          "[&>blockquote]:my-4 [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono",
          "[&>pre]:my-4 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:bg-muted [&>pre]:p-4",
          "[&>pre_code]:bg-transparent [&>pre_code]:p-0",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary/80",
          "[&>hr]:my-8 [&>hr]:border-border",
          "[&_strong]:font-semibold [&_strong]:text-foreground",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
