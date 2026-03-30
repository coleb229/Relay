"use client";

import { useState, useEffect } from "react";
import type { z } from "zod";
import type { countdownTimerConfigSchema } from "../schemas";

type CountdownConfig = z.infer<typeof countdownTimerConfigSchema>;

interface CountdownTimerSectionProps {
  config: CountdownConfig;
}

function calculateTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeSegment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center min-w-[3.5rem] h-16 rounded-lg bg-foreground/5 border border-border tabular-nums text-3xl font-bold text-foreground">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimerSection({ config }: CountdownTimerSectionProps) {
  const { heading, targetDate, expiredMessage, showDays, showSeconds } = config;
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Set a target date to start the countdown</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-medium text-muted-foreground">
          {expiredMessage || "This event has ended"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {heading && (
        <h3 className="text-xl font-semibold text-center">{heading}</h3>
      )}
      <div className="flex items-center justify-center gap-3">
        {showDays && <TimeSegment value={timeLeft.days} label="Days" />}
        <TimeSegment value={timeLeft.hours} label="Hours" />
        <TimeSegment value={timeLeft.minutes} label="Min" />
        {showSeconds && <TimeSegment value={timeLeft.seconds} label="Sec" />}
      </div>
    </div>
  );
}
