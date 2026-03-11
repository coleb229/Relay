"use client";

import { useState, useEffect } from "react";
import { LessonData, QuizQuestionData, QuizOptionData, QuestionType } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckIcon,
  PencilIcon,
  Trash2Icon,
  PlusIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";

interface Props {
  lesson: LessonData;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface LocalOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export function QuizBuilder({ lesson }: Props) {
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lessons/${lesson.id}/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lesson.id]);

  async function handleAddQuestion(type: QuestionType) {
    const res = await fetch(`/api/lessons/${lesson.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        prompt: "New question",
        order: questions.length,
      }),
    });
    if (!res.ok) return;
    const created: QuizQuestionData = await res.json();
    setQuestions((prev) => [...prev, created]);
  }

  async function handleDeleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Quiz Questions</h3>
        <AddQuestionDropdown onAdd={handleAddQuestion} />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <LoaderCircleIcon className="size-4 animate-spin" /> Loading...
        </p>
      )}
      {!loading && questions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
          No questions yet. Add your first question above.
        </p>
      )}

      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={index}
          onUpdate={(updated) =>
            setQuestions((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x))
            )
          }
          onDelete={() => handleDeleteQuestion(q.id)}
        />
      ))}
    </div>
  );
}

function AddQuestionDropdown({ onAdd }: { onAdd: (type: QuestionType) => void }) {
  const types: { label: string; value: QuestionType }[] = [
    { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
    { label: "True / False", value: "TRUE_FALSE" },
    { label: "Short Answer", value: "SHORT_ANSWER" },
  ];

  return (
    <div className="flex items-center gap-2">
      {types.map((t) => (
        <Button
          key={t.value}
          size="sm"
          variant="outline"
          onClick={() => onAdd(t.value)}
        >
          <PlusIcon className="size-3.5" />
          {t.label}
        </Button>
      ))}
    </div>
  );
}

function typeLabel(type: QuestionType) {
  if (type === "MULTIPLE_CHOICE") return "MC";
  if (type === "TRUE_FALSE") return "T/F";
  return "SA";
}

function QuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: QuizQuestionData;
  index: number;
  onUpdate: (updated: QuizQuestionData) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [expectedAnswer, setExpectedAnswer] = useState(
    question.expectedAnswer ?? ""
  );
  const [localOptions, setLocalOptions] = useState<LocalOption[]>(
    question.options.map((o) => ({ ...o }))
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Keep local state in sync if parent changes (e.g. after initial add)
  useEffect(() => {
    setPrompt(question.prompt);
    setExpectedAnswer(question.expectedAnswer ?? "");
    setLocalOptions(question.options.map((o) => ({ ...o })));
  }, [question]);

  async function handleSave() {
    setSaveStatus("saving");
    try {
      // PATCH prompt / expectedAnswer
      const patchRes = await fetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          expectedAnswer:
            question.type === "SHORT_ANSWER"
              ? expectedAnswer.trim() || null
              : undefined,
        }),
      });
      if (!patchRes.ok) throw new Error("patch failed");

      // PUT options (not for SHORT_ANSWER)
      if (question.type !== "SHORT_ANSWER") {
        const optRes = await fetch(`/api/questions/${question.id}/options`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            options: localOptions.map((o, i) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: i,
            })),
          }),
        });
        if (!optRes.ok) throw new Error("options failed");
        const { options } = await optRes.json();

        onUpdate({
          ...question,
          prompt: prompt.trim(),
          expectedAnswer: question.expectedAnswer,
          options,
        });
      } else {
        onUpdate({
          ...question,
          prompt: prompt.trim(),
          expectedAnswer: expectedAnswer.trim() || null,
        });
      }

      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
        setEditing(false);
      }, 1200);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {typeLabel(question.type)}
        </span>
        <span className="flex-1 text-sm font-medium truncate">{question.prompt}</span>
        <button
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={() => setEditing((v) => !v)}
          title="Edit question"
        >
          {editing ? <XIcon className="size-4" /> : <PencilIcon className="size-4" />}
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
            <Label>Question prompt</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter question"
            />
          </div>

          {/* MULTIPLE_CHOICE options */}
          {question.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              <Label>Options</Label>
              {localOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={opt.isCorrect}
                    onChange={() =>
                      setLocalOptions((prev) =>
                        prev.map((o, j) => ({ ...o, isCorrect: j === i }))
                      )
                    }
                    title="Mark as correct"
                  />
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
                    { text: "", isCorrect: false, order: prev.length },
                  ])
                }
              >
                <PlusIcon className="size-3.5" />
                Add Option
              </Button>
            </div>
          )}

          {/* TRUE_FALSE options */}
          {question.type === "TRUE_FALSE" && (
            <div className="space-y-2">
              <Label>Correct answer</Label>
              <div className="flex items-center gap-4">
                {localOptions.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      checked={opt.isCorrect}
                      onChange={() =>
                        setLocalOptions((prev) =>
                          prev.map((o, j) => ({ ...o, isCorrect: j === i }))
                        )
                      }
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SHORT_ANSWER expected answer */}
          {question.type === "SHORT_ANSWER" && (
            <div className="space-y-1.5">
              <Label>Expected answer (case-insensitive)</Label>
              <Input
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="Expected answer"
              />
            </div>
          )}

          {/* Save row */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === "saving" || !prompt.trim()}
            >
              {saveStatus === "saving" && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {saveStatus === "saving" ? "Saving…" : "Save"}
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
