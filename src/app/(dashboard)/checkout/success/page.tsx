import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let courseName = "your course";
  let courseId: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const cId = session.metadata?.courseId;
      if (cId) {
        courseId = cId;
        const course = await prisma.course.findUnique({
          where: { id: cId },
          select: { title: true },
        });
        if (course) courseName = course.title;
      }
    } catch {
      // silently fail — still show success page
    }
  }

  return (
    <EmptyState
      icon={CheckCircle}
      title="Payment Successful!"
      description={`You're now enrolled in ${courseName}. You can start learning right away.`}
      variant="centered"
    >
      <div className="flex items-center gap-3">
        {courseId && (
          <Button
            render={<Link href={`/courses/${courseId}`} />}
            nativeButton={false}
          >
            Start Learning
          </Button>
        )}
        <Button
          variant="outline"
          render={<Link href="/my-courses" />}
          nativeButton={false}
        >
          My Courses
        </Button>
      </div>
    </EmptyState>
  );
}
