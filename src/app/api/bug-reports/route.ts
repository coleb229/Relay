import { auth } from "../../../../auth";

const GITHUB_REPO = "coleb229/Relay";

const TYPE_PREFIX: Record<string, string> = {
  bug: "[Bug]",
  feature: "[Feature Request]",
  question: "[Question]",
};

const TYPE_LABEL: Record<string, string> = {
  bug: "bug",
  feature: "enhancement",
  question: "question",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, severity, pageUrl, imageUrls } = body as {
    title: string;
    description: string;
    type: "bug" | "feature" | "question";
    severity: "low" | "medium" | "high" | "critical";
    pageUrl: string;
    imageUrls: string[];
  };

  if (!title?.trim() || !description?.trim()) {
    return Response.json({ error: "Title and description are required" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: "GitHub integration not configured" }, { status: 503 });
  }

  const issueTitle = `${TYPE_PREFIX[type] ?? "[Bug]"} ${title.trim()}`;

  const screenshotSection =
    imageUrls?.length > 0
      ? `\n## Screenshots\n${imageUrls.map((url: string, i: number) => `![Screenshot ${i + 1}](${url})`).join("\n")}\n`
      : "";

  const issueBody = `## Description
${description.trim()}

## Details
| Field | Value |
|-------|-------|
| **Type** | ${type} |
| **Severity** | ${severity} |
| **Page** | ${pageUrl || "N/A"} |
| **Reporter** | ${session.user.name ?? "Unknown"} (${session.user.email ?? "no email"}) |
| **Role** | ${session.user.role} |
${screenshotSection}
---
_Submitted via Relay Bug Report_`;

  const labels = [TYPE_LABEL[type] ?? "bug", `severity: ${severity}`];

  // Try with labels first, retry without if labels don't exist on the repo
  let res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ title: issueTitle, body: issueBody, labels }),
  });

  if (res.status === 422) {
    // Labels likely don't exist — retry without them
    res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ title: issueTitle, body: issueBody }),
    });
  }

  if (!res.ok) {
    return Response.json({ error: "Failed to create report" }, { status: 502 });
  }

  const data = await res.json();
  return Response.json(
    { success: true, issueUrl: data.html_url, issueNumber: data.number },
    { status: 201 }
  );
}
