import { signIn } from "../../../../auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Layers, Zap } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="min-h-screen flex">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[oklch(0.25_0.06_275)] via-[oklch(0.18_0.04_275)] to-[oklch(0.12_0.03_275)] overflow-hidden">
        {/* Hero illustration */}
        <img src="/images/ui/login-hero.svg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen" />
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.44_0.24_275)] opacity-20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.75_0.14_80)] opacity-15 blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.75_0.16_80)]">
                <svg viewBox="0 0 24 24" fill="none" className="size-5 text-[oklch(0.17_0.025_275)]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Relay</span>
            </div>

            {/* Hero text */}
            <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
              Build and manage
              <br />
              <span className="text-[oklch(0.82_0.14_80)]">your learning platform</span>
            </h1>
            <p className="text-lg text-white/75 max-w-md leading-relaxed">
              Create courses, track student progress, and scale your educational business with a powerful, open-source LMS.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                <BookOpen className="size-4" />
              </div>
              <span className="text-sm">Rich course builder with modules, lessons & quizzes</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                <Layers className="size-4" />
              </div>
              <span className="text-sm">Full REST API for custom integrations</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                <Zap className="size-4" />
              </div>
              <span className="text-sm">Free & open-source — deploy on your own domain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center bg-background relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

        <div className="relative w-full max-w-sm px-4 sm:px-6">
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary mb-3 shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="size-6 text-primary-foreground" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Relay</h1>
            <p className="text-sm text-muted-foreground mt-1">LMS Platform</p>
          </div>

          <Card className="shadow-xl ring-1 ring-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: callbackUrl || "/" });
                }}
              >
                <Button type="submit" className="w-full gap-2" size="lg">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Access restricted to authorized team members only.
          </p>
        </div>
      </div>
    </div>
  );
}
