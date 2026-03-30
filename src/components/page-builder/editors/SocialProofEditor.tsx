"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon, TrashIcon, BookOpen } from "lucide-react";
import { FEATURE_ICONS, FEATURE_ICON_NAMES } from "../feature-icons";
import { ImageUploadField } from "./ImageUploadField";

interface StatItem {
  value: number;
  label: string;
  prefix: string;
  suffix: string;
  animate: boolean;
}

interface ActivityItem {
  name: string;
  action: string;
  timeAgo: string;
  avatarUrl: string | null;
}

interface BadgeItem {
  icon: string;
  label: string;
}

interface SocialProofConfig {
  heading: string;
  subheading: string;
  layout: "stats" | "activity" | "badges" | "combined";
  stats: StatItem[];
  activityFeed: ActivityItem[];
  badges: BadgeItem[];
  showActivityAnimation: boolean;
  maxVisibleActivities: number;
}

interface SocialProofEditorProps {
  config: SocialProofConfig;
  onChange: (config: SocialProofConfig) => void;
}

function BadgeIconPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const IconComponent = value ? (FEATURE_ICONS[value] ?? BookOpen) : BookOpen;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex size-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
        aria-label="Pick icon"
      >
        <IconComponent className="size-4" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-56 p-2">
        <div className="grid grid-cols-5 gap-1">
          {FEATURE_ICON_NAMES.map((name) => {
            const Icon = FEATURE_ICONS[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelect(name);
                  setOpen(false);
                }}
                className="flex size-8 items-center justify-center rounded-md hover:bg-muted transition-colors data-[active]:bg-primary/10"
                data-active={value === name ? "" : undefined}
                title={name}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SocialProofEditor({ config, onChange }: SocialProofEditorProps) {
  // ── Stats CRUD ─────────────────────────────────────────────────────

  function updateStat(index: number, updates: Partial<StatItem>) {
    const stats = [...config.stats];
    stats[index] = { ...stats[index], ...updates };
    onChange({ ...config, stats });
  }

  function addStat() {
    onChange({
      ...config,
      stats: [
        ...config.stats,
        { value: 0, label: "", prefix: "", suffix: "+", animate: true },
      ],
    });
  }

  function removeStat(index: number) {
    onChange({ ...config, stats: config.stats.filter((_, i) => i !== index) });
  }

  // ── Activity CRUD ──────────────────────────────────────────────────

  function updateActivity(index: number, updates: Partial<ActivityItem>) {
    const activityFeed = [...config.activityFeed];
    activityFeed[index] = { ...activityFeed[index], ...updates };
    onChange({ ...config, activityFeed });
  }

  function addActivity() {
    onChange({
      ...config,
      activityFeed: [
        ...config.activityFeed,
        { name: "", action: "enrolled", timeAgo: "2h ago", avatarUrl: null },
      ],
    });
  }

  function removeActivity(index: number) {
    onChange({
      ...config,
      activityFeed: config.activityFeed.filter((_, i) => i !== index),
    });
  }

  // ── Badges CRUD ────────────────────────────────────────────────────

  function updateBadge(index: number, updates: Partial<BadgeItem>) {
    const badges = [...config.badges];
    badges[index] = { ...badges[index], ...updates };
    onChange({ ...config, badges });
  }

  function addBadge() {
    onChange({
      ...config,
      badges: [...config.badges, { icon: "Shield", label: "" }],
    });
  }

  function removeBadge(index: number) {
    onChange({ ...config, badges: config.badges.filter((_, i) => i !== index) });
  }

  const showStats = config.layout === "stats" || config.layout === "combined";
  const showActivity =
    config.layout === "activity" || config.layout === "combined";
  const showBadges = config.layout === "badges" || config.layout === "combined";

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-1.5">
        <Label htmlFor="sp-heading">Heading</Label>
        <Input
          id="sp-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Trusted by Thousands"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sp-subheading">Subheading</Label>
        <Input
          id="sp-subheading"
          value={config.subheading}
          onChange={(e) => onChange({ ...config, subheading: e.target.value })}
          placeholder="Join our growing community"
        />
      </div>

      {/* Layout mode */}
      <div className="space-y-1.5">
        <Label>Layout</Label>
        <ToggleGroup
          value={[config.layout]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onChange({
                ...config,
                layout: values[0] as SocialProofConfig["layout"],
              });
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="combined">All</ToggleGroupItem>
          <ToggleGroupItem value="stats">Stats</ToggleGroupItem>
          <ToggleGroupItem value="activity">Activity</ToggleGroupItem>
          <ToggleGroupItem value="badges">Badges</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ── Stats section ────────────────────────────────────────────── */}
      {showStats && (
        <div className="space-y-3">
          <Label>Stats</Label>
          {config.stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border border-input p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Stat {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeStat(index)}
                  aria-label={`Remove stat ${index + 1}`}
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Input
                  value={stat.prefix}
                  onChange={(e) =>
                    updateStat(index, { prefix: e.target.value })
                  }
                  placeholder="$"
                  className="w-14"
                />
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) =>
                    updateStat(index, { value: Number(e.target.value) || 0 })
                  }
                  placeholder="5000"
                  className="flex-1"
                />
                <Input
                  value={stat.suffix}
                  onChange={(e) =>
                    updateStat(index, { suffix: e.target.value })
                  }
                  placeholder="+"
                  className="w-14"
                />
              </div>

              <Input
                value={stat.label}
                onChange={(e) => updateStat(index, { label: e.target.value })}
                placeholder="Students Enrolled"
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`sp-stat-animate-${index}`}
                  checked={stat.animate}
                  onCheckedChange={(checked) =>
                    updateStat(index, { animate: checked === true })
                  }
                />
                <Label htmlFor={`sp-stat-animate-${index}`} className="text-xs">
                  Animate on scroll
                </Label>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addStat}
            className="w-full"
          >
            <PlusIcon className="size-3.5" />
            Add Stat
          </Button>
        </div>
      )}

      {/* ── Activity Feed section ────────────────────────────────────── */}
      {showActivity && (
        <div className="space-y-3">
          <Label>Activity Feed</Label>

          <div className="space-y-1.5">
            <Label className="text-xs">Max Visible</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={config.maxVisibleActivities}
              onChange={(e) =>
                onChange({
                  ...config,
                  maxVisibleActivities: Number(e.target.value) || 3,
                })
              }
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="sp-activity-anim"
              checked={config.showActivityAnimation}
              onCheckedChange={(checked) =>
                onChange({
                  ...config,
                  showActivityAnimation: checked === true,
                })
              }
            />
            <Label htmlFor="sp-activity-anim" className="text-xs">
              Show animation
            </Label>
          </div>

          {config.activityFeed.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-input p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Activity {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeActivity(index)}
                  aria-label={`Remove activity ${index + 1}`}
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>

              <ImageUploadField
                label="Avatar"
                value={item.avatarUrl}
                onChange={(url) => updateActivity(index, { avatarUrl: url })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      updateActivity(index, { name: e.target.value })
                    }
                    placeholder="Sarah J."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Time</Label>
                  <Input
                    value={item.timeAgo}
                    onChange={(e) =>
                      updateActivity(index, { timeAgo: e.target.value })
                    }
                    placeholder="2h ago"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Action</Label>
                <Input
                  value={item.action}
                  onChange={(e) =>
                    updateActivity(index, { action: e.target.value })
                  }
                  placeholder="enrolled in this course"
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addActivity}
            className="w-full"
          >
            <PlusIcon className="size-3.5" />
            Add Activity
          </Button>
        </div>
      )}

      {/* ── Badges section ───────────────────────────────────────────── */}
      {showBadges && (
        <div className="space-y-3">
          <Label>Trust Badges</Label>

          {config.badges.map((badge, index) => (
            <div
              key={index}
              className="rounded-lg border border-input p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Badge {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeBadge(index)}
                  aria-label={`Remove badge ${index + 1}`}
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>

              <div className="flex items-start gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <BadgeIconPicker
                    value={badge.icon}
                    onSelect={(icon) => updateBadge(index, { icon })}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={badge.label}
                    onChange={(e) =>
                      updateBadge(index, { label: e.target.value })
                    }
                    placeholder="Money-Back Guarantee"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addBadge}
            className="w-full"
          >
            <PlusIcon className="size-3.5" />
            Add Badge
          </Button>
        </div>
      )}
    </div>
  );
}
