import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../../auth";
import { notFound, redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function QuizResultsPage({ params }: Props) {
  const [{ id, lessonId }, session] = await Promise.all([params, auth()]);

  if (!session) redirect("/");

  if (session.user.role === "STUDENT") redirect("/");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true },
  });

  if (!lesson) notFound();

  const questionCount = await prisma.quizQuestion.count({
    where: { lessonId },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: { lessonId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href={`/courses/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Back to course
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Quiz Results — {lesson.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} &middot;{" "}
          {questionCount} question{questionCount !== 1 ? "s" : ""}
        </p>
      </div>

      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No attempts yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => {
              const correct = Math.round(attempt.score * questionCount);
              const pct = Math.round(attempt.score * 100);
              return (
                <TableRow key={attempt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {attempt.user.name ?? "(no name)"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {correct}/{questionCount}
                    </span>{" "}
                    <span className="text-muted-foreground text-xs">
                      ({pct}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
