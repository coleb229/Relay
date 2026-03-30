"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/course-utils";

interface PublicEnrollButtonProps {
  courseId: string;
  price: number | null;
}

export function PublicEnrollButton({ courseId, price }: PublicEnrollButtonProps) {
  const isFree = !price || price <= 0;
  const callbackUrl = encodeURIComponent(`/courses/${courseId}`);

  return (
    <Button
      className="w-full"
      size="lg"
      render={<Link href={`/login?callbackUrl=${callbackUrl}`} />}
      nativeButton={false}
    >
      {isFree ? "Enroll Now \u2014 Free" : `${formatPrice(price)} \u2014 Get Started`}
    </Button>
  );
}
