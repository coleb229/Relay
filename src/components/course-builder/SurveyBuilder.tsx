"use client";

import { useState, useEffect } from "react";
import type { LessonData } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckIcon,
  PencilIcon,
  Trash2Icon,
  PlusIcon,
  LoaderCircleIcon,
  XIcon,
  GripVerticalIcon,
} from "lucide-react";

type SurveyQuestionType =
  | "TEXT"
  | "RATING"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "SCALE";

interface SurveyOptionData {
  id: string;
  text: string;
  order: number;
}

interface SurveyQuestionData {
  id: string;
  lessonId: string;
  type: SurveyQuestionType;
  prompt: string;
  order: number;
  required: boolean;
  options: SurveyOptionData[];
}

interface Props {
  lesson: LessonData;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const QUESTION_TYPE_OPTIONS: { value: SurveyQuestionType; label: string }[] = [
  { value: "TEXT", label: "Free Text" },
  { value: "RATING", label: "Star Rating (1-5)" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "CHECKBOX", label: "Checkboxes" },
  { value: "SCALE", label: "Numeric Scale (1-10)" },
];

export function SurveyBuilder({ lesson }: Props) {
  const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lessons/${lesson.id}/survey-questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lesson.id]);

  async function handleAddQuestion(type: SurveyQuestionType) {
    const res = await fetch(`/api/lessons/${lesson.id}/survey-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        prompt: "New question",
        order: questions.length,
        required: false,
        ...(type === "MULTIPLE_CHOICE" || type === "CHECKBOX"
          ? { options: [{ text: "Option 1" }, { text: "Option 2" }] }
          : {}),
      }),
    });
    if (!res.ok) return;
    const created: SurveyQuestionData = await res.json();
    setQuestions((prev) => [...prev, created]);
  }

  async function handleDeleteQuestion(id: string) {
    // Use batch update to remove the question
    const remaining = questions.filter((q) => q.id !== id);
    const res = await fetch(`/api/lessons/${lesson.id}/survey-questions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questions: remaining.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          order: i,
          required: q.required,
          options: q.options.map((o) => ({ text: o.text })),
        })),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.data ?? []);
    }
  }

  async function handleSaveAll(updatedQuestions: SurveyQuestionData[]) {
    const res = await fetch(`/api/lessons/${lesson.id}/survey-questions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questions: updatedQuestions.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          order: i,
          required: q.required,
          options: q.options.map((o) => ({ text: o.text })),
        })),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.data ?? []);
    }
    return res.ok;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Survey Questions</h3>
        <AddQuestionDropdown onAdd={handleAddQuestion} />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <LoaderCircleIcon className="size-4 animate-spin" /> Loading...
        </p>
      )}

      {!loading && questions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
          No questions yet. Add your first survey question above.
        </p>
      )}

      {questions.map((q, index) => (
        <SurveyQuestionCard
          key={q.id}
          question={q}
          index={index}
          onUpdate={(updated) => {
            const newQuestions = questions.map((x) =>
              x.id === updated.id ? updated : x
            );
            setQuestions(newQuestions);
          }}
          onSave={(updated) => {
            const newQuestions = questions.map((x) =>
              x.id === updated.id ? updated : x
            );
            return handleSaveAll(newQuestions);
          }}
          onDelete={() => handleDeleteQuestion(q.id)}
        />
      ))}
    </div>
  );
}

function AddQuestionDropdown({
  onAdd,
}: {
  onAdd: (type: SurveyQuestionType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
        <PlusIcon className="size-3.5" />
        Add Question
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 py-1 w-48">
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onAdd(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function typeLabel(type: SurveyQuestionType) {
  switch (type) {
    case "TEXT":
      return "Text";
    case "RATING":
      return "Rating";
    case "MULTIPLE_CHOICE":
      return "MC";
    case "CHECKBOX":
      return "Check";
    case "SCALE":
      return "Scale";
  }
}

function SurveyQuestionCard({
  question,
  index,
  onUpdate,
  onSave,
  onDelete,
}: {
  question: SurveyQuestionData;
  index: number;
  onUpdate: (updated: SurveyQuestionData) => void;
  onSave: (updated: SurveyQuestionData) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [required, setRequired] = useState(question.required);
  const [localOptions, setLocalOptions] = useState(
    question.options.map((o) => ({ ...o }))
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    setPrompt(question.prompt);
    setRequired(question.required);
    setLocalOptions(question.options.map((o) => ({ ...o })));
  }, [question]);

  async function handleSave() {
    setSaveStatus("saving");
    const updated: SurveyQuestionData = {
      ...question,
      prompt: prompt.trim(),
      required,
      options: localOptions,
    };
    const ok = await onSave(updated);
    if (ok) {
      onUpdate(updated);
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
        setEditing(false);
      }, 1200);
    } else {
      setSaveStatus("error");
    }
  }

  const hasOptions =
    question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX";

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GripVerticalIcon className="size-4 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {typeLabel(question.type)}
        </span>
        <span className="flex-1 text-sm font-medium truncate">
          {question.prompt}
        </span>
        {question.required && (
          <span className="text-xs text-destructive">Required</span>
        )}
        <button
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={() => setEditing((v) => !v)}
          title="Edit question"
        >
          {editing ? (
            <XIcon className="size-4" />
          ) : (
            <PencilIcon className="size-4" />
          )}
        </button>
        <button
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          title="Delete question"
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="space-y-4 pt-2 border-t">
          {/* Prompt */}
          <div className="space-y-1.5">
            <Label>Question text</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter question"
            />
          </div>

          {/* Required toggle */}
          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={required}
              onClick={() => setRequired((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                required ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-(--dur-feedback) ease-(--ease-out-quart) ${
                  required ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <Label
              className="cursor-pointer"
              onClick={() => setRequired((v) => !v)}
            >
              Required
            </Label>
          </div>

          {/* Options (MC / Checkbox) */}
          {hasOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              {localOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={opt.text}
                    onChange={(e) =>
                      setLocalOptions((prev) =>
                        prev.map((o, j) =>
                          j === i ? { ...o, text: e.target.value } : o
                        )
                      )
                    }
                    placeholder={`Option ${i + 1}`}
                    className="flex-1"
                  />
                  <button
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setLocalOptions((prev) => prev.filter((_, j) => j !== i))
                    }
                    title="Remove option"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setLocalOptions((prev) => [
                    ...prev,
                    {
                      id: `new-${Date.now()}`,
                      text: "",
                      order: prev.length,
                    },
                  ])
                }
              >
                <PlusIcon className="size-3.5" />
                Add Option
              </Button>
            </div>
          )}

          {/* Save */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === "saving" || !prompt.trim()}
            >
              {saveStatus === "saving" && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </Button>
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckIcon className="size-3.5" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-destructive">Failed to save.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
