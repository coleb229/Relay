// ─────────────────────────────────────────────────────────────────────────────
// API Registry
//
// Imports `definition` from every route file and flattens them into a list of
// ApiEndpoint objects. Import this on the server — never in client components.
//
// To add a new endpoint to the docs: export a `definition` from your route file
// and add it to the `routes` array below. That's it.
// ─────────────────────────────────────────────────────────────────────────────

import type { ApiEndpoint, HttpMethod, RouteDefinition } from "@/lib/api-docs";

import { definition as coursesDefinition } from "@/app/api/courses/route";
import { definition as courseByIdDefinition } from "@/app/api/courses/[id]/route";
import { definition as studentsDefinition } from "@/app/api/students/route";
import { definition as enrollmentsDefinition } from "@/app/api/enrollments/route";
import { definition as analyticsDefinition } from "@/app/api/analytics/route";

interface RouteEntry {
  path: string;
  tag: string;
  definition: RouteDefinition;
}

const routes: RouteEntry[] = [
  { path: "/api/courses", tag: "Courses", definition: coursesDefinition },
  { path: "/api/courses/{id}", tag: "Courses", definition: courseByIdDefinition },
  { path: "/api/students", tag: "Students", definition: studentsDefinition },
  { path: "/api/enrollments", tag: "Enrollments", definition: enrollmentsDefinition },
  { path: "/api/analytics", tag: "Analytics", definition: analyticsDefinition },
];

/** Returns all documented endpoints as a flat list, preserving method order. */
export function getEndpoints(): ApiEndpoint[] {
  const methodOrder: HttpMethod[] = ["GET", "POST", "PATCH", "PUT", "DELETE"];
  const endpoints: ApiEndpoint[] = [];

  for (const route of routes) {
    for (const method of methodOrder) {
      const def = route.definition[method];
      if (def) {
        endpoints.push({ method, path: route.path, tag: route.tag, def });
      }
    }
  }

  return endpoints;
}

/** Returns endpoints grouped by tag, respecting the original tag order. */
export function getEndpointsByTag(): Map<string, ApiEndpoint[]> {
  const map = new Map<string, ApiEndpoint[]>();
  for (const endpoint of getEndpoints()) {
    if (!map.has(endpoint.tag)) map.set(endpoint.tag, []);
    map.get(endpoint.tag)!.push(endpoint);
  }
  return map;
}
