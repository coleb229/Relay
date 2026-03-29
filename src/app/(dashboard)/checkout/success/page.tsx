import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="size-16 rounded-full bg-emerald-200 dark:bg-emerald-900/30 flex items-center justify-center animate-[pulse_2s_ease-in-out_1]">
          <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="absolute inset-0 rounded-full ring-4 ring-emerald-500/20 animate-ping repeat-[1] animation-duration-[1s]" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        You&apos;re now enrolled in <strong>{courseName}</strong>. You can start learning right away.
      </p>
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
    </div>
  );
}
