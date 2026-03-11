"use client";

import { useState } from "react";
import { AttemptResult } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  type: string;
  prompt: string;
  options: QuizOption[];
  expectedAnswer: string | null;
}

interface PreviousAttempt {
  score: number;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    selectedOptionId?: string | null;
    textAnswer?: string | null;
  }>;
}

interface Props {
  lessonId: string;
  questions: QuizQuestion[];
  latestAttempt: PreviousAttempt | null;
}

type AnswerState = Record<string, { selectedOptionId?: string; textAnswer?: string }>;

interface GradedAnswerData {
  questionId: string;
  isCorrect: boolean;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
}

export function QuizView({ lessonId, questions, latestAttempt }: Props) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  // Controls whether we show the previous attempt read-only or let user retake
  const [retaking, setRetaking] = useState(false);

  const showPreviousReadOnly = !!latestAttempt && !result && !retaking;

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
        return !!a.selectedOptionId;
      }
      return !!a.textAnswer?.trim();
    });

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, val]) => ({
            questionId,
            ...val,
          })),
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      const data: AttemptResult = await res.json();
      setResult(data);
      setRetaking(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  // Determine what answers/score to display
  const displayAnswers: GradedAnswerData[] = result?.answers ??
    (showPreviousReadOnly
      ? (latestAttempt?.answers.map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          selectedOptionId: a.selectedOptionId,
          textAnswer: a.textAnswer,
        })) ?? [])
      : []);

  const displayScore: number | null = result?.score ?? (showPreviousReadOnly ? (latestAttempt?.score ?? null) : null);

  return (
    <div className="space-y-6">
      {/* Score banner */}
      {displayScore !== null && (
        <ScoreBanner score={displayScore} isNew={!!result} />
      )}

      {/* Questions */}
      {questions.map((q, i) => {
        const gradedAnswer = displayAnswers.find((a) => a.questionId === q.id) ?? null;
        return (
          <QuestionBlock
            key={q.id}
            index={i}
            question={q}
            answer={answers[q.id]}
            onChange={(val) =>
              setAnswers((prev) => ({ ...prev, [q.id]: val }))
            }
            gradedAnswer={gradedAnswer}
            disabled={showPreviousReadOnly || !!result}
          />
        );
      })}

      {/* Submit button — active quiz */}
      {!result && !showPreviousReadOnly && (
        <Button onClick={handleSubmit} disabled={submitting || !allAnswered}>
          {submitting && (
            <LoaderCircleIcon className="size-4 animate-spin mr-2" />
          )}
          Submit Quiz
        </Button>
      )}

      {/* Retake after new result */}
      {result && (
        <Button
          variant="outline"
          onClick={() => {
            setResult(null);
            setAnswers({});
            setRetaking(true);
          }}
        >
          Retake Quiz
        </Button>
      )}

      {/* Retake when viewing previous attempt */}
      {showPreviousReadOnly && (
        <Button
          variant="outline"
          onClick={() => {
            setAnswers({});
            setRetaking(true);
          }}
        >
          Retake Quiz
        </Button>
      )}
    </div>
  );
}

function ScoreBanner({ score, isNew }: { score: number; isNew: boolean }) {
  const pct = Math.round(score * 100);
  const passed = pct >= 70;
  return (
    <div
      className={`rounded-lg p-4 flex items-center gap-3 ${
        passed
          ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
          : "bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800"
      }`}
    >
      {passed ? (
        <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <XCircleIcon className="size-5 text-red-600 dark:text-red-400 shrink-0" />
      )}
      <div>
        <p className="font-semibold text-sm">
          {isNew ? "Quiz submitted!" : "Previous attempt"} — Score: {pct}%
        </p>
        <p className="text-xs text-muted-foreground">
          {passed
            ? "Great job! You passed."
            : "Keep practicing — you need 70% to pass."}
        </p>
      </div>
    </div>
  );
}

function QuestionBlock({
  index,
  question,
  answer,
  onChange,
  gradedAnswer,
  disabled,
}: {
  index: number;
  question: QuizQuestion;
  answer: { selectedOptionId?: string; textAnswer?: string } | undefined;
  onChange: (val: { selectedOptionId?: string; textAnswer?: string }) => void;
  gradedAnswer: GradedAnswerData | null;
  disabled: boolean;
}) {
  const selectedId = answer?.selectedOptionId ?? gradedAnswer?.selectedOptionId ?? undefined;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-xs text-muted-foreground mt-0.5 w-5 shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{question.prompt}</p>
            {gradedAnswer && (
              <span className="shrink-0">
                {gradedAnswer.isCorrect ? (
                  <CheckCircleIcon className="size-4 text-emerald-500" />
                ) : (
                  <XCircleIcon className="size-4 text-red-500" />
                )}
              </span>
            )}
          </div>

          {/* MULTIPLE_CHOICE and TRUE_FALSE — both use radio options */}
          {(question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") && (
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const wasSelected = gradedAnswer?.selectedOptionId === opt.id;
                const highlightClass =
                  wasSelected && gradedAnswer
                    ? gradedAnswer.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : "bg-red-50 dark:bg-red-950/20"
                    : "";
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 text-sm rounded px-2 py-1.5 ${
                      disabled ? "cursor-default" : "cursor-pointer hover:bg-muted"
                    } ${highlightClass}`}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={opt.id}
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => onChange({ selectedOptionId: opt.id })}
                    />
                    {opt.text}
                  </label>
                );
              })}
              {gradedAnswer && !gradedAnswer.isCorrect && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your answer was incorrect.
                </p>
              )}
            </div>
          )}

          {/* SHORT_ANSWER */}
          {question.type === "SHORT_ANSWER" && (
            <div className="space-y-1.5">
              <Textarea
                value={answer?.textAnswer ?? (gradedAnswer?.textAnswer ?? "")}
                onChange={(e) => onChange({ textAnswer: e.target.value })}
                placeholder="Type your answer..."
                disabled={disabled}
                rows={3}
              />
              {gradedAnswer && !gradedAnswer.isCorrect && question.expectedAnswer && (
                <p className="text-xs text-muted-foreground">
                  Expected:{" "}
                  <span className="font-medium">{question.expectedAnswer}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
