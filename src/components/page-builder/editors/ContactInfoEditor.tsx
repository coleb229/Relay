"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { z } from "zod";
import type { contactInfoConfigSchema } from "../schemas";

type ContactInfoConfig = z.infer<typeof contactInfoConfigSchema>;

interface ContactInfoEditorProps {
  config: ContactInfoConfig;
  onChange: (config: ContactInfoConfig) => void;
}

const TYPE_DEFAULTS: Record<string, { icon: string; label: string }> = {
  address: { icon: "MapPin", label: "Address" },
  phone: { icon: "Phone", label: "Phone" },
  email: { icon: "Mail", label: "Email" },
  hours: { icon: "Clock", label: "Hours" },
  custom: { icon: "Info", label: "" },
};

const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
] as const;

export function ContactInfoEditor({ config, onChange }: ContactInfoEditorProps) {
  function addItem() {
    onChange({
      ...config,
      items: [
        ...config.items,
        { type: "custom" as const, icon: "Info", label: "", value: "", link: null },
      ],
    });
  }

  function removeItem(idx: number) {
    onChange({ ...config, items: config.items.filter((_, i) => i !== idx) });
  }

  function updateItem(idx: number, updates: Partial<ContactInfoConfig["items"][number]>) {
    const items = [...config.items];
    items[idx] = { ...items[idx], ...updates };
    onChange({ ...config, items });
  }

  function addSocial() {
    onChange({
      ...config,
      socialLinks: [
        ...config.socialLinks,
        { platform: "website" as const, url: "" },
      ],
    });
  }

  function removeSocial(idx: number) {
    onChange({
      ...config,
      socialLinks: config.socialLinks.filter((_, i) => i !== idx),
    });
  }

  function updateSocial(
    idx: number,
    updates: Partial<ContactInfoConfig["socialLinks"][number]>
  ) {
    const socialLinks = [...config.socialLinks];
    socialLinks[idx] = { ...socialLinks[idx], ...updates };
    onChange({ ...config, socialLinks });
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Contact Us"
        />
      </div>

      {/* Layout */}
      <div className="space-y-1.5">
        <Label className="text-xs">Layout</Label>
        <ToggleGroup
          value={[config.layout]}
          onValueChange={(values) => {
            if (values.length > 0)
              onChange({
                ...config,
                layout: values[values.length - 1] as ContactInfoConfig["layout"],
              });
          }}
        >
          <ToggleGroupItem value="card">Card</ToggleGroupItem>
          <ToggleGroupItem value="inline">Inline</ToggleGroupItem>
          <ToggleGroupItem value="split">Split</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Contact Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Contact Items</Label>
          <Button variant="outline" size="xs" onClick={addItem}>
            <PlusIcon className="size-3" />
            Item
          </Button>
        </div>

        {config.items.map((item, idx) => (
          <div
            key={`item-${idx}`}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Item {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeItem(idx)}
                aria-label={`Remove item ${idx + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <Select
              value={item.type}
              onValueChange={(value) => {
                if (value) {
                  const defaults = TYPE_DEFAULTS[value] ?? TYPE_DEFAULTS.custom;
                  updateItem(idx, {
                    type: value as ContactInfoConfig["items"][number]["type"],
                    icon: defaults.icon,
                    label: item.label || defaults.label,
                  });
                }
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={item.label}
              onChange={(e) => updateItem(idx, { label: e.target.value })}
              placeholder="Label"
              className="text-xs"
            />

            {item.type === "hours" ? (
              <Textarea
                value={item.value}
                onChange={(e) => updateItem(idx, { value: e.target.value })}
                placeholder="Mon-Fri: 9am-5pm&#10;Sat: 10am-2pm"
                className="text-xs min-h-16"
                rows={3}
              />
            ) : (
              <Input
                value={item.value}
                onChange={(e) => updateItem(idx, { value: e.target.value })}
                placeholder={
                  item.type === "email"
                    ? "hello@example.com"
                    : item.type === "phone"
                      ? "+1 (555) 123-4567"
                      : item.type === "address"
                        ? "123 Main St, City, State"
                        : "Value"
                }
                className="text-xs"
              />
            )}

            <Input
              value={item.link ?? ""}
              onChange={(e) =>
                updateItem(idx, { link: e.target.value || null })
              }
              placeholder="Link (auto-generated if empty)"
              className="text-xs"
            />
          </div>
        ))}

        {config.items.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add items like address, phone, email, or hours.
          </p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Social Links</Label>
          <Button variant="outline" size="xs" onClick={addSocial}>
            <PlusIcon className="size-3" />
            Link
          </Button>
        </div>

        {config.socialLinks.map((social, idx) => (
          <div
            key={`social-${idx}`}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Select
                value={social.platform}
                onValueChange={(value) => {
                  if (value)
                    updateSocial(idx, {
                      platform: value as ContactInfoConfig["socialLinks"][number]["platform"],
                    });
                }}
              >
                <SelectTrigger size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeSocial(idx)}
                aria-label={`Remove ${social.platform}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>
            <Input
              value={social.url}
              onChange={(e) => updateSocial(idx, { url: e.target.value })}
              placeholder="https://"
              className="text-xs"
            />
          </div>
        ))}
      </div>

      {/* Map Toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="ci-show-map"
            checked={config.showMap}
            onCheckedChange={(checked) =>
              onChange({ ...config, showMap: checked === true })
            }
          />
          <Label htmlFor="ci-show-map" className="text-xs">
            Show embedded map
          </Label>
        </div>

        {config.showMap && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Map Embed URL</Label>
              <Textarea
                value={config.mapEmbedUrl}
                onChange={(e) =>
                  onChange({ ...config, mapEmbedUrl: e.target.value })
                }
                placeholder='Paste Google Maps embed URL or <iframe> code...'
                className="min-h-16 font-mono text-xs"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Map Height</Label>
              <ToggleGroup
                value={[config.mapHeight]}
                onValueChange={(values) => {
                  if (values.length > 0)
                    onChange({
                      ...config,
                      mapHeight: values[values.length - 1] as ContactInfoConfig["mapHeight"],
                    });
                }}
              >
                <ToggleGroupItem value="sm">Small</ToggleGroupItem>
                <ToggleGroupItem value="md">Medium</ToggleGroupItem>
                <ToggleGroupItem value="lg">Large</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
