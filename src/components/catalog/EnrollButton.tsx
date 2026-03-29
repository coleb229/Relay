"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { CheckoutButton } from "@/components/payments/CheckoutButton";

interface EnrollButtonProps {
  courseId: string;
  price: number | null;
  enrollment?: {
    id: string;
    status: string;
    progressCount: number;
    totalLessons: number;
  } | null;
}

export function EnrollButton({ courseId, price, enrollment }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFree = !price || price <= 0;

  async function handleEnroll() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/enrollments/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 201 || res.status === 409) {
        router.refresh();
        return;
      }

      const data = await res.json();
      setError(data.error ?? "Enrollment failed");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (enrollment) {
    const percent =
      enrollment.totalLessons > 0
        ? Math.round((enrollment.progressCount / enrollment.totalLessons) * 100)
        : 0;

    return (
      <div className="space-y-3">
        <Progress value={percent}>
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <Button
          className="w-full"
          render={<Link href={`/courses/${courseId}`} />}
          nativeButton={false}
        >
          Continue Learning &rarr;
        </Button>
      </div>
    );
  }

  if (!isFree) {
    return <CheckoutButton courseId={courseId} price={price!} />;
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" disabled={loading} onClick={handleEnroll}>
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          "Enroll Now \u2014 Free"
        )}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
