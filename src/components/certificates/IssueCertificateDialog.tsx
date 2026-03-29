"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssueCertificateDialogProps {
  open: boolean;
  onClose: () => void;
  templates: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; title: string }>;
}

export function IssueCertificateDialog({ open, onClose, templates, courses }: IssueCertificateDialogProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Look up student by email
      const studentRes = await fetch(`/api/students?search=${encodeURIComponent(studentEmail)}&limit=1`);
      const studentData = await studentRes.json();
      const student = studentData.data?.[0];
      if (!student) {
        setError("Student not found with that email");
        setLoading(false);
        return;
      }

      // Find enrollment
      const enrollRes = await fetch(`/api/enrollments?userId=${student.id}&courseId=${courseId}&limit=1`);
      const enrollData = await enrollRes.json();
      const enrollment = enrollData.data?.[0];
      if (!enrollment) {
        setError("Student is not enrolled in this course");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          userId: student.id,
          courseId,
          enrollmentId: enrollment.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to issue certificate");
        setLoading(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
            <Award className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Issue Certificate</h2>
            <p className="text-xs text-muted-foreground">Manually issue a certificate to a student</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Template</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
              className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Student Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
              placeholder="student@example.com"
              className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Issuing..." : "Issue Certificate"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
