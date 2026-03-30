"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CopyIcon, CheckIcon } from "lucide-react";
import type { CodeBlockSection as CodeBlockSectionType } from "../schemas";
import hljs from "highlight.js/lib/core";

// Register common languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import ruby from "highlight.js/lib/languages/ruby";
import php from "highlight.js/lib/languages/php";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("java", java);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("php", php);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("markdown", markdown);

// Language display names for the badge
const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  java: "Java",
  c: "C",
  cpp: "C++",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  yaml: "YAML",
  markdown: "Markdown",
  plaintext: "Plain Text",
};

interface CodeBlockSectionProps {
  config: CodeBlockSectionType["config"];
}

export function CodeBlockSection({ config }: CodeBlockSectionProps) {
  const { code, language, filename, showLineNumbers, theme, wrapLines } = config;
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    if (!code) return "";
    if (language === "plaintext" || !hljs.getLanguage(language)) {
      return hljs.highlight(code, { language: "plaintext" }).value;
    }
    return hljs.highlight(code, { language }).value;
  }, [code, language]);

  const lines = code.split("\n");
  const isDark = theme === "dark";

  if (!code) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">Add code to display</p>
      </div>
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 space-y-2">
      <div
        className={cn(
          "rounded-lg overflow-hidden text-sm",
          isDark ? "bg-[#0d1117]" : "bg-[#f6f8fa]"
        )}
      >
        {/* Header bar */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 text-xs",
            isDark
              ? "border-b border-[#30363d] text-[#8b949e]"
              : "border-b border-[#d0d7de] text-[#57606a]"
          )}
        >
          <div className="flex items-center gap-3">
            {filename && (
              <span className="font-medium">{filename}</span>
            )}
            <span className={cn("rounded-md px-2 py-0.5", isDark ? "bg-[#1c2128]" : "bg-[#eaeef2]")}>
              {LANGUAGE_LABELS[language] ?? language}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
              isDark ? "hover:bg-[#1c2128]" : "hover:bg-[#eaeef2]"
            )}
          >
            {copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code block */}
        <div className={cn("overflow-x-auto", wrapLines && "overflow-x-visible")}>
          <div className="flex">
            {/* Line numbers */}
            {showLineNumbers && (
              <div
                className={cn(
                  "select-none shrink-0 py-4 pl-4 pr-3 text-right font-mono tabular-nums leading-relaxed",
                  isDark ? "text-[#484f58]" : "text-[#8c959f]"
                )}
                aria-hidden
              >
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}

            {/* Code content */}
            <pre
              className={cn(
                "flex-1 py-4 pr-4 font-mono leading-relaxed",
                showLineNumbers ? "pl-2" : "pl-4",
                wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre",
                isDark ? "text-[#e6edf3]" : "text-[#1f2328]"
              )}
            >
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
