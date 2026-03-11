import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

// Edge-safe proxy. Uses authConfig (empty providers, JWT-only session check).
// No Prisma, no Node.js-only deps — safe for Edge Runtime.
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
