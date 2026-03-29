"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BookOpen, LoaderCircle } from "lucide-react";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogGrid } from "./CatalogGrid";
import type { CatalogCardProps } from "./CatalogCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CatalogBrowserProps {
  initialCourses: CatalogCardProps["course"][];
  initialTotalCount: number;
  categories: { id: string; name: string; color: string | null }[];
  userId: string;
}

const PAGE_SIZE = 12;

export function CatalogBrowser({
  initialCourses,
  initialTotalCount,
  categories,
  userId,
}: CatalogBrowserProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [courses, setCourses] =
    useState<CatalogCardProps["course"][]>(initialCourses);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [enrollments, setEnrollments] = useState<
    Map<string, CatalogCardProps["enrollment"]>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchCourses = useCallback(
    async (params: {
      search: string;
      categoryId: string;
      page: number;
    }) => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("status", "PUBLISHED");
        if (params.search) query.set("search", params.search);
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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchCourses({ search, categoryId, page });
  }, [search, categoryId, page, fetchCourses]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryIdChange = useCallback((value: string) => {
    setCategoryId(value);
    setPage(1);
  }, []);

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Courses
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover courses to start your learning journey
        </p>
      </div>

      {/* Filters */}
      <CatalogFilters
        search={search}
        onSearchChange={handleSearchChange}
        categoryId={categoryId}
        onCategoryIdChange={handleCategoryIdChange}
        categories={categories}
      />

      {/* Count + loading */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "course" : "courses"} available
        </p>
        {loading && (
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <LoaderCircle className="size-3.5 animate-spin" />
            Loading...
          </p>
        )}
      </div>

      {/* Course grid or empty state */}
      {courses.length > 0 ? (
        <CatalogGrid courses={courses} enrollments={enrollments} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="size-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or filters to find what you&apos;re
            looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
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
