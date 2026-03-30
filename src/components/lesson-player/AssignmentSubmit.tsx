"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  LoaderCircleIcon,
  SendIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  FileIcon,
  ClipboardCheckIcon,
} from "lucide-react";

interface Submission {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  score: number | null;
  feedback: string | null;
  status: "SUBMITTED" | "GRADED" | "RETURNED" | "RESUBMITTED";
  submittedAt: string;
  gradedAt: string | null;
  gradedBy: { id: string; name: string | null } | null;
}

interface Props {
  lessonId: string;
  assignmentType: string | null;
  instructions: string | null;
  maxScore: number | null;
  dueDate: string | null;
  allowLate: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  SUBMITTED: {
    label: "Submitted",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    icon: <ClockIcon className="size-3.5" />,
  },
  GRADED: {
    label: "Graded",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: <CheckCircleIcon className="size-3.5" />,
  },
  RETURNED: {
    label: "Returned",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    icon: <AlertCircleIcon className="size-3.5" />,
  },
  RESUBMITTED: {
    label: "Resubmitted",
    color:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
    icon: <ClockIcon className="size-3.5" />,
  },
};

export function AssignmentSubmit({
  lessonId,
  assignmentType,
  instructions,
  maxScore,
  dueDate,
  allowLate,
}: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch(`/api/lessons/${lessonId}/submissions`);
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.data);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const isPastDue = dueDate ? new Date() > new Date(dueDate) : false;
  const canSubmit = !isPastDue || allowLate;
  const latestSubmission = submissions[0];
  const canResubmit =
    latestSubmission?.status === "RETURNED" && canSubmit;

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/lessons/${lessonId}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.ok) {
      setContent("");
      setShowForm(false);
      fetchSubmissions();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {instructions && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Instructions
          </p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: instructions }}
          />
        </div>
      )}

      {/* Meta bar */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        {maxScore && (
          <span className="text-muted-foreground">
            Max score: <strong>{maxScore}</strong>
          </span>
        )}
        {assignmentType && (
          <span className="text-muted-foreground">
            Submission: <strong>{assignmentType.toLowerCase()}</strong>
          </span>
        )}
        {dueDate && (
          <span
            className={`${isPastDue ? "text-destructive" : "text-muted-foreground"}`}
          >
            Due: <strong>{new Date(dueDate).toLocaleDateString()}</strong>
            {isPastDue && !allowLate && " (closed)"}
            {isPastDue && allowLate && " (late submissions accepted)"}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
          <LoaderCircleIcon className="size-4 animate-spin" />
          Loading submissions...
        </div>
      )}

      {/* Previous submissions */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Your Submissions</h3>
          {submissions.map((sub) => {
            const config = STATUS_CONFIG[sub.status];
            return (
              <div key={sub.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  {sub.score !== null && maxScore && (
                    <span className="text-sm font-semibold tabular-nums">
                      {sub.score}/{maxScore}
                    </span>
                  )}
                </div>

                {/* Submission content */}
                {sub.content && (
                  <div className="text-sm bg-muted/30 rounded p-3 whitespace-pre-wrap">
                    {sub.content}
                  </div>
                )}
                {sub.fileUrl && (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <FileIcon className="size-3.5" />
                    {sub.fileName ?? "Download file"}
                  </a>
                )}

                {/* Feedback */}
                {sub.feedback && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      Instructor Feedback
                      {sub.gradedBy?.name && ` from ${sub.gradedBy.name}`}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {sub.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit / Resubmit */}
      {!loading && (
        <>
          {/* No submission yet or returned for resubmission */}
          {(submissions.length === 0 || canResubmit) && canSubmit && (
            <>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <ClipboardCheckIcon className="size-3.5" />
                  {canResubmit ? "Resubmit Assignment" : "Submit Assignment"}
                </Button>
              )}

              {showForm && (
                <div className="space-y-3 border rounded-lg p-4">
                  <h3 className="text-sm font-semibold">
                    {canResubmit ? "Resubmit" : "Your Submission"}
                  </h3>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your submission here..."
                    rows={6}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !content.trim()}
                    >
                      {submitting ? (
                        <LoaderCircleIcon className="size-3.5 animate-spin" />
                      ) : (
                        <SendIcon className="size-3.5" />
                      )}
                      Submit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Already submitted and waiting */}
          {submissions.length > 0 &&
            !canResubmit &&
            latestSubmission?.status === "SUBMITTED" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ClockIcon className="size-4" />
                Your submission is being reviewed.
              </p>
            )}

          {/* Past due and can't submit */}
          {!canSubmit && submissions.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <AlertCircleIcon className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                The deadline for this assignment has passed.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
