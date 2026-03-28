"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Session } from "next-auth";
import { CourseFilters } from "./CourseFilters";
import { CourseBatchActions } from "./CourseBatchActions";
import { CourseGrid } from "./CourseGrid";
import { CourseList } from "./CourseList";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type CourseWithDetails = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number | null;
  category: { id: string; name: string; color: string | null } | null;
  instructor: { name: string | null; email: string | null };
  _count: { enrollments: number };
};

interface CourseManagerProps {
  initialCourses: CourseWithDetails[];
  initialTotalCount: number;
  categories: { id: string; name: string; color: string | null }[];
  session: Session;
}

const PAGE_SIZE = 20;

export function CourseManager({
  initialCourses,
  initialTotalCount,
  categories,
  session,
}: CourseManagerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<CourseWithDetails[]>(initialCourses);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const selectionMode = selectedIds.size > 0;
  const canCreate =
    session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const fetchCourses = useCallback(
    async (params: {
      search: string;
      status: string;
      categoryId: string;
      page: number;
    }) => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.status !== "all") query.set("status", params.status);
        if (params.categoryId !== "all")
          query.set("categoryId", params.categoryId);
        query.set("page", String(params.page));
        query.set("limit", String(PAGE_SIZE));

        const res = await fetch(`/api/courses?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setCourses(json.data ?? json);
          setTotalCount(json.totalCount ?? 0);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Re-fetch when filters or page change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchCourses({ search, status, categoryId, page });
  }, [search, status, categoryId, page, fetchCourses]);

  // Reset page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleCategoryIdChange = useCallback((value: string) => {
    setCategoryId(value);
    setPage(1);
  }, []);

  // Selection
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Batch actions
  async function batchUpdateStatus(newStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED") {
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/courses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      )
    );
    setSelectedIds(new Set());
    fetchCourses({ search, status, categoryId, page });
  }

  async function batchDelete() {
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/courses/${id}`, {
          method: "DELETE",
        })
      )
    );
    setSelectedIds(new Set());
    fetchCourses({ search, status, categoryId, page });
  }

  // Pagination helpers
  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="space-y-4">
      <CourseFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        categoryId={categoryId}
        onCategoryIdChange={handleCategoryIdChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        canCreate={canCreate}
        userId={session.user.id}
      />

      <CourseBatchActions
        selectedCount={selectedIds.size}
        onPublish={() => batchUpdateStatus("PUBLISHED")}
        onUnpublish={() => batchUpdateStatus("DRAFT")}
        onArchive={() => batchUpdateStatus("ARCHIVED")}
        onDelete={batchDelete}
        onDeselectAll={handleDeselectAll}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {courses.length} of {totalCount} courses
        </p>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </div>

      {viewMode === "grid" ? (
        <CourseGrid
          courses={courses}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onSelect={handleSelect}
        />
      ) : (
        <CourseList
          courses={courses}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onSelect={handleSelect}
        />
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
