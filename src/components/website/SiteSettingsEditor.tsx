"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckIcon,
  LoaderCircleIcon,
  Palette,
  Type,
  Globe,
  Share2,
  Code,
} from "lucide-react";

interface SiteSettingsData {
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  footerText: string | null;
  socialLinks: Record<string, string> | null;
  customCss: string | null;
  analyticsId: string | null;
}

interface SiteSettingsEditorProps {
  initialSettings: SiteSettingsData;
}

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function SiteSettingsEditor({ initialSettings }: SiteSettingsEditorProps) {
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (key: keyof SiteSettingsData, value: string | Record<string, string> | null) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const updateSocialLink = useCallback((key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks ?? {}), [key]: value },
    }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/site/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: settings.siteName,
          tagline: settings.tagline || null,
          logoUrl: settings.logoUrl || null,
          faviconUrl: settings.faviconUrl || null,
          primaryColor: settings.primaryColor || null,
          accentColor: settings.accentColor || null,
          fontFamily: settings.fontFamily || null,
          footerText: settings.footerText || null,
          socialLinks: settings.socialLinks,
          customCss: settings.customCss || null,
          analyticsId: settings.analyticsId || null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const socialKeys = ["twitter", "facebook", "linkedin", "youtube", "instagram"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            render={<Link href="/website" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Site Settings</h1>
            <p className="text-sm text-muted-foreground">
              Branding, colors, social links, and advanced settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />}
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckIcon className="size-3.5" />
              Saved
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* General */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4 text-muted-foreground" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsField
            label="Site Name"
            value={settings.siteName}
            onChange={(v) => update("siteName", v)}
            placeholder="My School"
          />
          <SettingsField
            label="Tagline"
            value={settings.tagline ?? ""}
            onChange={(v) => update("tagline", v)}
            placeholder="Learn something new today"
          />
          <SettingsField
            label="Logo URL"
            value={settings.logoUrl ?? ""}
            onChange={(v) => update("logoUrl", v)}
            placeholder="https://..."
          />
          <SettingsField
            label="Favicon URL"
            value={settings.faviconUrl ?? ""}
            onChange={(v) => update("faviconUrl", v)}
            placeholder="https://..."
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Footer Text</label>
            <textarea
              value={settings.footerText ?? ""}
              onChange={(e) => update("footerText", e.target.value)}
              placeholder="© 2026 My School. All rights reserved."
              rows={2}
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none resize-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-muted-foreground" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor ?? "#7c3aed"}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="size-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor ?? ""}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  placeholder="#7c3aed"
                  className="flex-1 rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Accent Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accentColor ?? "#f59e0b"}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="size-8 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accentColor ?? ""}
                  onChange={(e) => update("accentColor", e.target.value)}
                  placeholder="#f59e0b"
                  className="flex-1 rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          <SettingsField
            label="Font Family"
            value={settings.fontFamily ?? ""}
            onChange={(v) => update("fontFamily", v)}
            placeholder="Inter, system-ui, sans-serif"
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="size-4 text-muted-foreground" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialKeys.map((key) => (
            <SettingsField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={(settings.socialLinks as Record<string, string>)?.[key] ?? ""}
              onChange={(v) => updateSocialLink(key, v)}
              placeholder={`https://${key}.com/...`}
            />
          ))}
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="size-4 text-muted-foreground" />
            Advanced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsField
            label="Google Analytics ID"
            value={settings.analyticsId ?? ""}
            onChange={(v) => update("analyticsId", v)}
            placeholder="G-XXXXXXXXXX"
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Custom CSS</label>
            <textarea
              value={settings.customCss ?? ""}
              onChange={(e) => update("customCss", e.target.value)}
              placeholder=".my-class { color: red; }"
              rows={5}
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm font-mono outline-none resize-y focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
