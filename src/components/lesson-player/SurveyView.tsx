"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LoaderCircleIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  StarIcon,
} from "lucide-react";

interface SurveyOption {
  id: string;
  text: string;
  order: number;
}

interface SurveyQuestion {
  id: string;
  type: "TEXT" | "RATING" | "MULTIPLE_CHOICE" | "CHECKBOX" | "SCALE";
  prompt: string;
  order: number;
  required: boolean;
  options: SurveyOption[];
}

interface Props {
  lessonId: string;
  currentUserId: string;
}

type Answers = Record<string, string | number | string[]>;

export function SurveyView({ lessonId, currentUserId }: Props) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingResponse, setExistingResponse] = useState(false);

  const fetchData = useCallback(async () => {
    const [qRes, rRes] = await Promise.all([
      fetch(`/api/lessons/${lessonId}/survey-questions`),
      fetch(`/api/lessons/${lessonId}/survey-responses`),
    ]);

    if (qRes.ok) {
      const qData = await qRes.json();
      setQuestions(qData.data);
    }

    if (rRes.ok) {
      const rData = await rRes.json();
      const myResponse = rData.data?.find(
        (r: { userId: string }) => r.userId === currentUserId
      );
      if (myResponse) {
        setExistingResponse(true);
        setAnswers(myResponse.answers as Answers);
        setSubmitted(true);
      }
    }

    setLoading(false);
  }, [lessonId, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allRequiredAnswered = questions
    .filter((q) => q.required)
    .every((q) => {
      const a = answers[q.id];
      if (a === undefined || a === "") return false;
      if (Array.isArray(a) && a.length === 0) return false;
      return true;
    });

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/lessons/${lessonId}/survey-responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (res.ok) {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
        <LoaderCircleIcon className="size-4 animate-spin" />
        Loading survey...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <ClipboardListIcon className="size-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          This survey has no questions yet.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg p-4 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center gap-3">
          <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {existingResponse
                ? "You have already completed this survey."
                : "Survey submitted! Thank you for your feedback."}
            </p>
          </div>
        </div>

        {/* Show read-only answers */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground mt-0.5 w-5 shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.prompt}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatAnswer(answers[q.id], q)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Questions */}
      {questions.map((q, i) => (
        <QuestionField
          key={q.id}
          question={q}
          index={i}
          value={answers[q.id]}
          onChange={(val) =>
            setAnswers((prev) => ({ ...prev, [q.id]: val }))
          }
        />
      ))}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || !allRequiredAnswered}
      >
        {submitting && <LoaderCircleIcon className="size-4 animate-spin" />}
        Submit Survey
      </Button>
    </div>
  );
}

function QuestionField({
  question,
  index,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  index: number;
  value: string | number | string[] | undefined;
  onChange: (val: string | number | string[]) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-xs text-muted-foreground mt-0.5 w-5 shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium">
            {question.prompt}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </p>

          {/* TEXT */}
          {question.type === "TEXT" && (
            <Textarea
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer..."
              rows={3}
            />
          )}

          {/* RATING (1-5 stars) */}
          {question.type === "RATING" && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange(n)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <StarIcon
                    className={`size-6 ${
                      (value as number) >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {value && (
                <span className="text-sm text-muted-foreground ml-2">
                  {value}/5
                </span>
              )}
            </div>
          )}

          {/* MULTIPLE_CHOICE (single select) */}
          {question.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {question.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2 text-sm rounded px-2 py-1.5 cursor-pointer hover:bg-muted ${
                    value === opt.id ? "bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`survey-${question.id}`}
                    checked={value === opt.id}
                    onChange={() => onChange(opt.id)}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          )}

          {/* CHECKBOX (multi select) */}
          {question.type === "CHECKBOX" && (
            <div className="space-y-2">
              {question.options.map((opt) => {
                const selected = Array.isArray(value)
                  ? value.includes(opt.id)
                  : false;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 text-sm rounded px-2 py-1.5 cursor-pointer hover:bg-muted ${
                      selected ? "bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const current = Array.isArray(value) ? value : [];
                        onChange(
                          selected
                            ? current.filter((id) => id !== opt.id)
                            : [...current, opt.id]
                        );
                      }}
                    />
                    {opt.text}
                  </label>
                );
              })}
            </div>
          )}

          {/* SCALE (1-10) */}
          {question.type === "SCALE" && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={`size-9 rounded-lg border text-sm font-medium transition-colors ${
                      (value as number) === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Not at all</span>
                <span>Extremely</span>
              </div>
            </div>
          )}

          {/* SCALE with slider fallback for small screens */}
          {question.type === "SCALE" && (
            <div className="sm:hidden space-y-1">
              <Input
                type="range"
                min="1"
                max="10"
                value={(value as number) ?? 5}
                onChange={(e) => onChange(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-medium">{value ?? 5}</span>
                <span>10</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAnswer(
  value: string | number | string[] | undefined,
  question: SurveyQuestion
): string {
  if (value === undefined || value === "") return "No answer";
  if (question.type === "RATING") return `${value}/5 stars`;
  if (question.type === "SCALE") return `${value}/10`;
  if (question.type === "MULTIPLE_CHOICE") {
    const opt = question.options.find((o) => o.id === value);
    return opt?.text ?? String(value);
  }
  if (question.type === "CHECKBOX" && Array.isArray(value)) {
    return value
      .map((id) => question.options.find((o) => o.id === id)?.text ?? id)
      .join(", ");
  }
  return String(value);
}
