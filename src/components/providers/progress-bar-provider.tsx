"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ProgressBar
        height="2.5px"
        color="oklch(0.44 0.24 275)"
        options={{ showSpinner: false, trickleSpeed: 150 }}
        shallowRouting
      />
    </>
  );
}
