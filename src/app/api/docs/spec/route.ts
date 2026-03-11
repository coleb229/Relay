import { getEndpoints } from "@/lib/api-registry";

/**
 * GET /api/docs/spec
 *
 * Returns the full API endpoint registry as JSON.
 * This endpoint is always current — it reads directly from the route definitions
 * at request time. No build step or codegen required.
 */
export function GET() {
  return Response.json(getEndpoints());
}
