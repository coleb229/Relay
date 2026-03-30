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
import { definition as categoriesDefinition } from "@/app/api/categories/route";
import { definition as categoryByIdDefinition } from "@/app/api/categories/[id]/route";
import { definition as certTemplatesDefinition } from "@/app/api/certificates/templates/route";
import { definition as certTemplateByIdDefinition } from "@/app/api/certificates/templates/[id]/route";
import { definition as certificatesDefinition } from "@/app/api/certificates/route";
import { definition as certificateByIdDefinition } from "@/app/api/certificates/[id]/route";
import { definition as certificateRevokeDefinition } from "@/app/api/certificates/[id]/revoke/route";
import { definition as certificateBulkDefinition } from "@/app/api/certificates/bulk/route";
import { definition as certificateVerifyDefinition } from "@/app/api/certificates/verify/[code]/route";
import { definition as myCertificatesDefinition } from "@/app/api/certificates/my/route";
import { definition as pagesDefinition } from "@/app/api/pages/route";
import { definition as pageByIdDefinition } from "@/app/api/pages/[id]/route";
import { definition as siteNavigationDefinition } from "@/app/api/site/navigation/route";
import { definition as siteSettingsDefinition } from "@/app/api/site/settings/route";
import { definition as submissionsDefinition } from "@/app/api/lessons/[id]/submissions/route";
import { definition as submissionByIdDefinition } from "@/app/api/lessons/[id]/submissions/[submissionId]/route";
import { definition as surveyQuestionsDefinition } from "@/app/api/lessons/[id]/survey-questions/route";
import { definition as surveyResponsesDefinition } from "@/app/api/lessons/[id]/survey-responses/route";
import { definition as discussionDefinition } from "@/app/api/lessons/[id]/discussion/route";
import { definition as discussionReactionsDefinition } from "@/app/api/lessons/[id]/discussion/[postId]/reactions/route";
import { definition as courseBySlugDefinition } from "@/app/api/courses/by-slug/[slug]/route";
import { definition as pageBySlugDefinition } from "@/app/api/pages/by-slug/[slug]/route";

interface RouteEntry {
  path: string;
  tag: string;
  definition: RouteDefinition;
}

const routes: RouteEntry[] = [
  { path: "/api/courses", tag: "Courses", definition: coursesDefinition },
  { path: "/api/courses/{id}", tag: "Courses", definition: courseByIdDefinition },
  { path: "/api/courses/by-slug/{slug}", tag: "Courses", definition: courseBySlugDefinition },
  { path: "/api/students", tag: "Students", definition: studentsDefinition },
  { path: "/api/enrollments", tag: "Enrollments", definition: enrollmentsDefinition },
  { path: "/api/analytics", tag: "Analytics", definition: analyticsDefinition },
  { path: "/api/categories", tag: "Categories", definition: categoriesDefinition },
  { path: "/api/categories/{id}", tag: "Categories", definition: categoryByIdDefinition },
  { path: "/api/certificates/templates", tag: "Certificates", definition: certTemplatesDefinition },
  { path: "/api/certificates/templates/{id}", tag: "Certificates", definition: certTemplateByIdDefinition },
  { path: "/api/certificates", tag: "Certificates", definition: certificatesDefinition },
  { path: "/api/certificates/{id}", tag: "Certificates", definition: certificateByIdDefinition },
  { path: "/api/certificates/{id}/revoke", tag: "Certificates", definition: certificateRevokeDefinition },
  { path: "/api/certificates/bulk", tag: "Certificates", definition: certificateBulkDefinition },
  { path: "/api/certificates/verify/{code}", tag: "Certificates", definition: certificateVerifyDefinition },
  { path: "/api/certificates/my", tag: "Certificates", definition: myCertificatesDefinition },
  { path: "/api/pages", tag: "Website", definition: pagesDefinition },
  { path: "/api/pages/{id}", tag: "Website", definition: pageByIdDefinition },
  { path: "/api/pages/by-slug/{slug}", tag: "Website", definition: pageBySlugDefinition },
  { path: "/api/site/navigation", tag: "Website", definition: siteNavigationDefinition },
  { path: "/api/site/settings", tag: "Website", definition: siteSettingsDefinition },
  { path: "/api/lessons/{id}/submissions", tag: "Assignments", definition: submissionsDefinition },
  { path: "/api/lessons/{id}/submissions/{submissionId}", tag: "Assignments", definition: submissionByIdDefinition },
  { path: "/api/lessons/{id}/survey-questions", tag: "Surveys", definition: surveyQuestionsDefinition },
  { path: "/api/lessons/{id}/survey-responses", tag: "Surveys", definition: surveyResponsesDefinition },
  { path: "/api/lessons/{id}/discussion", tag: "Discussions", definition: discussionDefinition },
  { path: "/api/lessons/{id}/discussion/{postId}/reactions", tag: "Discussions", definition: discussionReactionsDefinition },
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
