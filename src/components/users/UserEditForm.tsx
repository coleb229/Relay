"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    role: UserRole;
  };
}

export function UserEditForm({ user }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          bio: bio.trim() || null,
          role,
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-bio">
          Bio{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="user-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          size="sm"
        >
          {saveStatus === "saving" && (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          )}
          {saveStatus === "saving" ? "Saving…" : "Save Changes"}
        </Button>
        {saveStatus === "saved" && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckIcon className="size-3.5" /> Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-destructive">
            Failed to save. Try again.
          </span>
        )}
      </div>
    </div>
  );
}
