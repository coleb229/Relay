"use client";

import type { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { countdownTimerConfigSchema } from "../schemas";

type CountdownConfig = z.infer<typeof countdownTimerConfigSchema>;

interface CountdownTimerEditorProps {
  config: CountdownConfig;
  onChange: (config: CountdownConfig) => void;
}

export function CountdownTimerEditor({ config, onChange }: CountdownTimerEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="countdown-heading">Heading</Label>
        <Input
          id="countdown-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Launching Soon"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="countdown-target">Target Date & Time</Label>
        <Input
          id="countdown-target"
          type="datetime-local"
          value={config.targetDate ? config.targetDate.slice(0, 16) : ""}
          onChange={(e) =>
            onChange({
              ...config,
              targetDate: e.target.value ? new Date(e.target.value).toISOString() : "",
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="countdown-expired">Expired Message</Label>
        <Input
          id="countdown-expired"
          value={config.expiredMessage}
          onChange={(e) => onChange({ ...config, expiredMessage: e.target.value })}
          placeholder="This event has ended"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="countdown-days"
          checked={config.showDays}
          onCheckedChange={(checked) =>
            onChange({ ...config, showDays: !!checked })
          }
        />
        <Label htmlFor="countdown-days" className="cursor-pointer">
          Show days
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="countdown-seconds"
          checked={config.showSeconds}
          onCheckedChange={(checked) =>
            onChange({ ...config, showSeconds: !!checked })
          }
        />
        <Label htmlFor="countdown-seconds" className="cursor-pointer">
          Show seconds
        </Label>
      </div>
    </div>
  );
}
