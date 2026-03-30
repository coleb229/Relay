import { auth } from "../../../../auth";
import { getEndpointsByTag } from "@/lib/api-registry";
import { DocsClient, type DocCategory } from "./DocsClient";

const CATEGORIES: DocCategory[] = [
  {
    name: "Learning Management",
    description: "Core course catalog, student roster, enrollment lifecycle, and taxonomy",
    tags: ["Courses", "Categories", "Students", "Enrollments"],
  },
  {
    name: "Content & Assessment",
    description: "Lesson assignments, survey collection, and threaded discussions",
    tags: ["Assignments", "Surveys", "Discussions"],
  },
  {
    name: "Credentials",
    description: "Certificate templates, issuance, bulk operations, and public verification",
    tags: ["Certificates"],
  },
  {
    name: "Platform",
    description: "Dashboard analytics, page builder, site navigation, and branding settings",
    tags: ["Analytics", "Website"],
  },
];

export default async function DocsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const allGroups = getEndpointsByTag();

  // Filter adminOnly endpoints for non-admins, convert to plain object for serialization
  const groups: Record<string, import("@/lib/api-docs").ApiEndpoint[]> = {};
  let totalEndpoints = 0;
  for (const [tag, endpoints] of allGroups) {
    const visible = isAdmin ? endpoints : endpoints.filter((e) => !e.def.adminOnly);
    if (visible.length > 0) {
      groups[tag] = visible;
      totalEndpoints += visible.length;
    }
  }

  return (
    <DocsClient
      categories={CATEGORIES}
      groups={groups}
      totalEndpoints={totalEndpoints}
    />
  );
}
