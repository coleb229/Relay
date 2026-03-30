"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SunIcon, MoonIcon } from "lucide-react";
import type { z } from "zod";
import type { codeBlockConfigSchema } from "../schemas";

type CodeBlockConfig = z.infer<typeof codeBlockConfigSchema>;

interface CodeBlockEditorProps {
  config: CodeBlockConfig;
  onChange: (config: CodeBlockConfig) => void;
}

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
] as const;

export function CodeBlockEditor({ config, onChange }: CodeBlockEditorProps) {
  return (
    <div className="space-y-4">
      {/* Code */}
      <div className="space-y-1.5">
        <Label className="text-xs">Code</Label>
        <Textarea
          value={config.code}
          onChange={(e) => onChange({ ...config, code: e.target.value })}
          placeholder="Paste your code here..."
          className="min-h-48 font-mono text-sm"
          rows={10}
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <Label className="text-xs">Language</Label>
        <Select
          value={config.language}
          onValueChange={(value) => {
            if (value) onChange({ ...config, language: value });
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filename */}
      <div className="space-y-1.5">
        <Label className="text-xs">Filename</Label>
        <Input
          value={config.filename}
          onChange={(e) => onChange({ ...config, filename: e.target.value })}
          placeholder="e.g. index.ts"
        />
      </div>

      {/* Theme */}
      <div className="space-y-1.5">
        <Label className="text-xs">Theme</Label>
        <ToggleGroup
          value={[config.theme]}
          onValueChange={(values) => {
            if (values.length > 0) onChange({ ...config, theme: values[values.length - 1] as "light" | "dark" });
          }}
        >
          <ToggleGroupItem value="light" className="gap-1.5">
            <SunIcon className="h-3.5 w-3.5" />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" className="gap-1.5">
            <MoonIcon className="h-3.5 w-3.5" />
            Dark
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label className="text-xs">Options</Label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={config.showLineNumbers}
            onCheckedChange={(checked) =>
              onChange({ ...config, showLineNumbers: checked === true })
            }
          />
          Show line numbers
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={config.wrapLines}
            onCheckedChange={(checked) =>
              onChange({ ...config, wrapLines: checked === true })
            }
          />
          Wrap long lines
        </label>
      </div>
    </div>
  );
}
