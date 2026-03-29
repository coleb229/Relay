"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  CheckIcon,
  LoaderCircleIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  href: string;
  target: string | null;
  order: number;
  visible: boolean;
  children?: NavItem[];
}

interface NavigationEditorProps {
  initialHeaderItems: NavItem[];
  initialFooterItems: NavItem[];
  pages: { id: string; title: string; slug: string }[];
}

function NavItemRow({
  item,
  onUpdate,
  onRemove,
  isChild,
}: {
  item: NavItem;
  onUpdate: (id: string, data: Partial<NavItem>) => void;
  onRemove: (id: string) => void;
  isChild?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background p-2",
        isChild && "ml-6"
      )}
    >
      <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
      <input
        type="text"
        value={item.label}
        onChange={(e) => onUpdate(item.id, { label: e.target.value })}
        placeholder="Label"
        className="w-28 rounded border bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        type="text"
        value={item.href}
        onChange={(e) => onUpdate(item.id, { href: e.target.value })}
        placeholder="/path or URL"
        className="flex-1 rounded border bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <input
          type="checkbox"
          checked={item.visible}
          onChange={(e) => onUpdate(item.id, { visible: e.target.checked })}
          className="rounded"
        />
        Visible
      </label>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function NavSection({
  title,
  items,
  onSave,
  pages,
}: {
  title: string;
  items: NavItem[];
  onSave: (items: NavItem[]) => Promise<void>;
  pages: { id: string; title: string; slug: string }[];
}) {
  const [localItems, setLocalItems] = useState<NavItem[]>(items);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const updateItem = useCallback((id: string, data: Partial<NavItem>) => {
    setLocalItems((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, ...data };
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === id ? { ...child, ...data } : child
            ),
          };
        }
        return item;
      })
    );
    setSaved(false);
  }, []);

  const removeItem = useCallback((id: string) => {
    setLocalItems((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.id !== id),
        }))
    );
    setSaved(false);
  }, []);

  function addItem() {
    const newItem: NavItem = {
      id: `temp-${Date.now()}`,
      label: "",
      href: "/",
      target: null,
      order: localItems.length,
      visible: true,
      children: [],
    };
    setLocalItems((prev) => [...prev, newItem]);
    setSaved(false);
  }

  function addFromPage(pageSlug: string, pageTitle: string) {
    const newItem: NavItem = {
      id: `temp-${Date.now()}`,
      label: pageTitle,
      href: `/p/${pageSlug}`,
      target: null,
      order: localItems.length,
      visible: true,
      children: [],
    };
    setLocalItems((prev) => [...prev, newItem]);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(localItems);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            ({localItems.length} items)
          </span>
        </button>
        <div className="flex items-center gap-2">
          {saving && <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />}
          {saved && <CheckIcon className="size-3.5 text-emerald-500" />}
          <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-2">
          {localItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No items yet. Add links from your pages or create custom links.
            </p>
          ) : (
            localItems.map((item) => (
              <div key={item.id}>
                <NavItemRow
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
                {item.children?.map((child) => (
                  <NavItemRow
                    key={child.id}
                    item={child}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                    isChild
                  />
                ))}
              </div>
            ))
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add Link
            </Button>

            {pages.length > 0 && (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  Add from Pages
                  <ChevronDown className="size-3" />
                </Button>
                <div className="absolute left-0 top-full z-10 hidden group-focus-within:block hover:block w-56 rounded-md border bg-popover p-1 shadow-md">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => addFromPage(page.slug, page.title)}
                      className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      {page.title}{" "}
                      <span className="text-xs text-muted-foreground">
                        /{page.slug}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function NavigationEditor({
  initialHeaderItems,
  initialFooterItems,
  pages,
}: NavigationEditorProps) {
  async function saveNavigation(location: string, items: NavItem[]) {
    const payload = items.map((item, i) => ({
      label: item.label,
      href: item.href,
      target: item.target,
      order: i,
      visible: item.visible,
      children: item.children?.map((child, j) => ({
        label: child.label,
        href: child.href,
        target: child.target,
        order: j,
        visible: child.visible,
      })),
    }));

    await fetch("/api/site/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, items: payload }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/website" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          className="size-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Navigation</h1>
          <p className="text-sm text-muted-foreground">
            Manage header and footer navigation links
          </p>
        </div>
      </div>

      <NavSection
        title="Header Navigation"
        items={initialHeaderItems}
        onSave={(items) => saveNavigation("header", items)}
        pages={pages}
      />

      <NavSection
        title="Footer Navigation"
        items={initialFooterItems}
        onSave={(items) => saveNavigation("footer", items)}
        pages={pages}
      />
    </div>
  );
}
