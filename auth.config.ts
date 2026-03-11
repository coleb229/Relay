import type { NextAuthConfig } from "next-auth";

// Edge-safe config — NO providers, no Node.js-only deps.
// Used by the proxy (src/proxy.ts) which runs in Edge Runtime.
// Only handles JWT session checking; provider logic stays in auth.ts.
export const authConfig = {
  trustHost: true,
  providers: [], // intentionally empty — added in auth.ts with credentials
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Always allow NextAuth API routes through
      if (pathname.startsWith("/api/auth")) return true;

      // Redirect logged-in users away from /login
      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      // Require auth for everything else
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
