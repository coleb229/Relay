"use client";

import { cn } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Info,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { ContactInfoSection as ContactInfoSectionType } from "../schemas";

interface ContactInfoSectionProps {
  config: ContactInfoSectionType["config"];
}

const CONTACT_ICONS: Record<string, LucideIcon> = {
  MapPin,
  Phone,
  Mail,
  Clock,
  Info,
};

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Globe,
  github: Github,
  website: Globe,
};

const MAP_HEIGHT = { sm: 200, md: 300, lg: 400 } as const;

function autoLink(type: string, value: string, link: string | null): string | null {
  if (link) return link;
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  if (type === "address")
    return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
  return null;
}

export function ContactInfoSection({ config }: ContactInfoSectionProps) {
  const { heading, layout, items, socialLinks, showMap, mapEmbedUrl, mapHeight } =
    config;

  if (items.length === 0 && socialLinks.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-12 text-sm text-muted-foreground">
          Add contact items to display your contact information
        </div>
      </div>
    );
  }

  const contactItems = (
    <div className={cn(layout === "inline" ? "flex flex-wrap gap-6" : "space-y-4")}>
      {items.map((item, idx) => {
        const IconComp = CONTACT_ICONS[item.icon] ?? Info;
        const href = autoLink(item.type, item.value, item.link);

        return (
          <div key={`contact-${idx}`} className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconComp className="size-4" />
            </div>
            <div className="min-w-0">
              {item.label && (
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
              )}
              {href ? (
                <a
                  href={href}
                  target={item.type === "address" ? "_blank" : undefined}
                  rel={item.type === "address" ? "noopener noreferrer" : undefined}
                  className="text-sm text-foreground underline-offset-2 duration-(--dur-feedback) ease-(--ease-out-quart) hover:text-primary hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-line">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const socialRow = socialLinks.length > 0 && (
    <div className="flex items-center gap-2 pt-2">
      {socialLinks.map((social, idx) => {
        const SocialIcon = SOCIAL_ICONS[social.platform] ?? Globe;
        return (
          <a
            key={`social-${idx}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
            aria-label={social.platform}
          >
            <SocialIcon className="size-4" />
          </a>
        );
      })}
    </div>
  );

  const mapEmbed = showMap && mapEmbedUrl && (
    <div className="overflow-hidden rounded-lg">
      <iframe
        src={
          mapEmbedUrl.match(/src=["']([^"']+)["']/)
            ? mapEmbedUrl.match(/src=["']([^"']+)["']/)![1]
            : mapEmbedUrl.trim()
        }
        width="100%"
        height={MAP_HEIGHT[mapHeight]}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location map"
      />
    </div>
  );

  if (layout === "split") {
    return (
      <div className="mx-auto max-w-5xl px-6 space-y-4">
        {heading && (
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        )}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {contactItems}
            {socialRow}
          </div>
          <div>{mapEmbed || <div className="h-full rounded-lg bg-muted/30" />}</div>
        </div>
      </div>
    );
  }

  if (layout === "inline") {
    return (
      <div className="mx-auto max-w-5xl px-6 space-y-4">
        {heading && (
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        )}
        {contactItems}
        {socialRow}
        {mapEmbed}
      </div>
    );
  }

  // card layout (default)
  return (
    <div className="mx-auto max-w-2xl px-6 space-y-4">
      <div className="rounded-xl border border-border/60 p-6 space-y-5">
        {heading && (
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        )}
        {contactItems}
        {socialRow}
        {mapEmbed}
      </div>
    </div>
  );
}
