"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Type, Image, Square, QrCode, Variable, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateStatusBadge } from "@/components/certificates/CertificateStatusBadge";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { cn } from "@/lib/utils";

interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "qrcode" | "variable";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  content?: string;
  variableName?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  shapeType?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface DesignData {
  elements: DesignElement[];
  background?: { color?: string; imageUrl?: string };
  dimensions?: { width: number; height: number };
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  designData: DesignData;
  status: string;
  orientation: string;
  logoUrl: string | null;
  instructorSignatureUrl: string | null;
  backgroundColor: string | null;
  borderStyle: string | null;
  courseId: string | null;
  course: { id: string; title: string } | null;
}

interface EditorProps {
  template: Template;
  courses: Array<{ id: string; title: string }>;
}

const sampleVariables = {
  studentName: "Jane Student",
  courseTitle: "Introduction to TypeScript",
  completionDate: "March 29, 2026",
  grade: "A+",
  instructorName: "Dr. John Smith",
  certificateNumber: "CERT-A1B2C3",
};

const variableOptions = [
  { name: "studentName", label: "Student Name" },
  { name: "courseTitle", label: "Course Title" },
  { name: "completionDate", label: "Completion Date" },
  { name: "grade", label: "Grade" },
  { name: "instructorName", label: "Instructor Name" },
  { name: "certificateNumber", label: "Certificate #" },
];

type ResizeHandle = "nw" | "ne" | "sw" | "se";

export function CertificateTemplateEditorPage({ template: initial, courses }: EditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [status, setStatus] = useState(initial.status);
  const [orientation, setOrientation] = useState(initial.orientation);
  const [backgroundColor, setBackgroundColor] = useState(initial.backgroundColor ?? "#ffffff");
  const [borderStyle, setBorderStyle] = useState(initial.borderStyle ?? "classic");
  const [courseId, setCourseId] = useState(initial.courseId ?? "");
  const [elements, setElements] = useState<DesignElement[]>(
    (initial.designData as DesignData)?.elements ?? []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showPreview, setShowPreview] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const placementCounterRef = useRef(0);
  const didDragRef = useRef(false);

  // Drag state
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    startElX: number;
    startElY: number;
  } | null>(null);

  // Resize state
  const [resizeState, setResizeState] = useState<{
    elementId: string;
    handle: ResizeHandle;
    startPointerX: number;
    startPointerY: number;
    startElX: number;
    startElY: number;
    startElW: number;
    startElH: number;
  } | null>(null);

  const selectedElement = elements.find((e) => e.id === selectedId);

  const save = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await fetch(`/api/certificates/templates/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          status,
          orientation,
          backgroundColor,
          borderStyle,
          courseId: courseId || null,
          designData: { elements, background: { color: backgroundColor }, dimensions: { width: 1056, height: 816 } },
        }),
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }, [initial.id, name, description, status, orientation, backgroundColor, borderStyle, courseId, elements]);

  // Auto-save with debounce
  useEffect(() => {
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [name, description, status, orientation, backgroundColor, borderStyle, courseId, elements, save]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
      if (e.key === "Escape") {
        if (editingId) { setEditingId(null); return; }
        setSelectedId(null);
      }

      const isInput = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "SELECT";

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !isInput && !editingId) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }

      // Arrow key nudging
      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && !isInput) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId) return el;
            const updates: Partial<DesignElement> = {};
            if (e.key === "ArrowUp") updates.y = Math.max(0, el.y - step);
            if (e.key === "ArrowDown") updates.y = Math.min(100 - el.height, el.y + step);
            if (e.key === "ArrowLeft") updates.x = Math.max(0, el.x - step);
            if (e.key === "ArrowRight") updates.x = Math.min(100 - el.width, el.x + step);
            return { ...el, ...updates };
          })
        );
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, editingId, save]);

  // --- Element placement ---

  const addElement = (type: DesignElement["type"], variableName?: string) => {
    const count = placementCounterRef.current++;
    const col = count % 5;
    const row = Math.floor(count / 5) % 4;
    const x = 5 + col * 15;
    const y = 5 + row * 18;

    const maxZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex ?? 0)) : 0;

    const el: DesignElement = {
      id: Math.random().toString(36).slice(2, 10),
      type,
      x,
      y,
      width: type === "qrcode" ? 10 : 40,
      height: type === "qrcode" ? 13 : 8,
      zIndex: maxZ + 1,
      content: type === "text" ? "Certificate of Completion" : undefined,
      variableName: type === "variable" ? variableName : undefined,
      fontSize: type === "variable" ? 24 : 16,
      fontWeight: type === "variable" ? "bold" : "normal",
      color: "#1a1a1a",
      textAlign: "center",
      shapeType: type === "shape" ? "rectangle" : undefined,
      fill: type === "shape" ? "#7c3aed20" : undefined,
      stroke: type === "shape" ? "#7c3aed" : undefined,
      strokeWidth: type === "shape" ? 2 : undefined,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  // --- Drag handlers ---

  const handlePointerDown = useCallback((e: React.PointerEvent, el: DesignElement) => {
    if ((e.target as HTMLElement).dataset.resizeHandle) return;
    // Don't start drag if inline-editing this element
    if (editingId === el.id) return;
    e.stopPropagation();
    // Capture on canvas so events continue even as the element moves
    canvasRef.current?.setPointerCapture(e.pointerId);
    setSelectedId(el.id);
    setDragState({
      elementId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startElX: el.x,
      startElY: el.y,
    });
  }, [editingId]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, el: DesignElement) => {
    if (el.type === "text" || el.type === "variable") {
      e.stopPropagation();
      setSelectedId(el.id);
      setEditingId(el.id);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (resizeState && canvasRef.current) {
      // --- Resize logic ---
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - resizeState.startPointerX) / rect.width) * 100;
      const deltaY = ((e.clientY - resizeState.startPointerY) / rect.height) * 100;
      const { handle, startElX, startElY, startElW, startElH } = resizeState;

      let newX = startElX;
      let newY = startElY;
      let newW = startElW;
      let newH = startElH;

      if (handle === "se") {
        newW = Math.max(3, startElW + deltaX);
        newH = Math.max(3, startElH + deltaY);
      } else if (handle === "sw") {
        newX = startElX + deltaX;
        newW = Math.max(3, startElW - deltaX);
        newH = Math.max(3, startElH + deltaY);
        if (newW <= 3) newX = startElX + startElW - 3;
      } else if (handle === "ne") {
        newW = Math.max(3, startElW + deltaX);
        newY = startElY + deltaY;
        newH = Math.max(3, startElH - deltaY);
        if (newH <= 3) newY = startElY + startElH - 3;
      } else if (handle === "nw") {
        newX = startElX + deltaX;
        newW = Math.max(3, startElW - deltaX);
        newY = startElY + deltaY;
        newH = Math.max(3, startElH - deltaY);
        if (newW <= 3) newX = startElX + startElW - 3;
        if (newH <= 3) newY = startElY + startElH - 3;
      }

      // Clamp within canvas
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newW = Math.min(100 - newX, newW);
      newH = Math.min(100 - newY, newH);

      // Snap to 0.5% grid
      newX = Math.round(newX * 2) / 2;
      newY = Math.round(newY * 2) / 2;
      newW = Math.round(newW * 2) / 2;
      newH = Math.round(newH * 2) / 2;

      updateElement(resizeState.elementId, { x: newX, y: newY, width: newW, height: newH });
      return;
    }

    if (dragState && canvasRef.current) {
      // --- Drag logic ---
      const rect = canvasRef.current.getBoundingClientRect();
      const el = elements.find((el) => el.id === dragState.elementId);
      if (!el) return;

      let newX = dragState.startElX + ((e.clientX - dragState.startX) / rect.width) * 100;
      let newY = dragState.startElY + ((e.clientY - dragState.startY) / rect.height) * 100;

      // Snap to 0.5% grid
      newX = Math.round(newX * 2) / 2;
      newY = Math.round(newY * 2) / 2;

      // Clamp within canvas
      newX = Math.max(0, Math.min(100 - el.width, newX));
      newY = Math.max(0, Math.min(100 - el.height, newY));

      updateElement(dragState.elementId, { x: newX, y: newY });
    }
  }, [dragState, resizeState, elements, updateElement]);

  const handlePointerUp = useCallback(() => {
    if (dragState || resizeState) didDragRef.current = true;
    setDragState(null);
    setResizeState(null);
  }, [dragState, resizeState]);

  // --- Resize handle handlers ---

  const handleResizePointerDown = useCallback((e: React.PointerEvent, el: DesignElement, handle: ResizeHandle) => {
    e.stopPropagation();
    canvasRef.current?.setPointerCapture(e.pointerId);
    setSelectedId(el.id);
    setResizeState({
      elementId: el.id,
      handle,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startElX: el.x,
      startElY: el.y,
      startElW: el.width,
      startElH: el.height,
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={(props) => <Link {...props} href="/certificates" />} nativeButton={false}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent text-lg font-semibold text-foreground outline-none focus:border-b-2 focus:border-primary"
          />
          <TemplateStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-3.5 w-3.5" data-icon="inline-start" />
            {showPreview ? "Editor" : "Preview"}
          </Button>
          <Button size="sm" onClick={save}>
            <Save className="h-3.5 w-3.5" data-icon="inline-start" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Element palette */}
        <div className="w-48 shrink-0 border-r border-border overflow-y-auto p-3 space-y-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Add Elements</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => addElement("text")} className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)">
                <Type className="h-4 w-4 text-muted-foreground" /> Text
              </button>
              <button onClick={() => addElement("image")} className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)">
                <Image className="h-4 w-4 text-muted-foreground" /> Image
              </button>
              <button onClick={() => addElement("shape")} className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)">
                <Square className="h-4 w-4 text-muted-foreground" /> Shape
              </button>
              <button onClick={() => addElement("qrcode")} className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)">
                <QrCode className="h-4 w-4 text-muted-foreground" /> QR Code
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Variables</p>
            <div className="space-y-1">
              {variableOptions.map((v) => (
                <button
                  key={v.name}
                  onClick={() => addElement("variable", v.name)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                >
                  <Variable className="h-3 w-3 text-violet-500" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Settings</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Orientation</label>
                <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs">
                  <option value="LANDSCAPE">Landscape</option>
                  <option value="PORTRAIT">Portrait</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Border</label>
                <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs">
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Background</label>
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="mt-0.5 h-7 w-full cursor-pointer rounded border border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Course</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs">
                  <option value="">Global (all courses)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          {showPreview ? (
            <div className="mx-auto max-w-3xl">
              <CertificatePreview
                designData={{ elements, background: { color: backgroundColor } }}
                variables={sampleVariables}
                orientation={orientation as "LANDSCAPE" | "PORTRAIT"}
                backgroundColor={backgroundColor}
                borderStyle={borderStyle}
                className="shadow-lg"
              />
            </div>
          ) : (
            <div
              ref={canvasRef}
              className={cn(
                "relative mx-auto bg-white shadow-lg",
                orientation === "LANDSCAPE" ? "aspect-[4/3] max-w-3xl" : "aspect-[3/4] max-w-md"
              )}
              style={{ backgroundColor }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={() => {
                if (didDragRef.current) { didDragRef.current = false; return; }
                setSelectedId(null);
                setEditingId(null);
              }}
            >
              {elements.map((el) => (
                <div
                  key={el.id}
                  className={cn(
                    "absolute select-none touch-none border-2",
                    dragState?.elementId === el.id
                      ? "cursor-grabbing border-violet-500 opacity-90 shadow-lg"
                      : selectedId === el.id
                        ? "cursor-grab border-violet-500 shadow-sm"
                        : "cursor-grab border-transparent hover:border-violet-300/60"
                  )}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    zIndex: el.zIndex ?? 0,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  onDoubleClick={(e) => handleDoubleClick(e, el)}
                >
                  {(el.type === "text" || el.type === "variable") && (
                    editingId === el.id && el.type === "text" ? (
                      <textarea
                        autoFocus
                        value={el.content ?? ""}
                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { setEditingId(null); }
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                          fontSize: `${el.fontSize ?? 16}px`,
                          fontWeight: el.fontWeight ?? "normal",
                          color: el.color ?? "#000",
                          textAlign: (el.textAlign as React.CSSProperties["textAlign"]) ?? "center",
                          fontFamily: el.fontFamily,
                        }}
                        className="h-full w-full resize-none border-none bg-transparent leading-tight outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    ) : (
                      <p
                        style={{
                          fontSize: `${el.fontSize ?? 16}px`,
                          fontWeight: el.fontWeight ?? "normal",
                          color: el.color ?? "#000",
                          textAlign: (el.textAlign as React.CSSProperties["textAlign"]) ?? "center",
                          fontFamily: el.fontFamily,
                        }}
                        className="pointer-events-none h-full w-full leading-tight"
                      >
                        {el.type === "variable"
                          ? sampleVariables[el.variableName as keyof typeof sampleVariables] ?? `{{${el.variableName}}}`
                          : el.content}
                      </p>
                    )
                  )}
                  {el.type === "shape" && (
                    <div
                      className="pointer-events-none h-full w-full"
                      style={{
                        backgroundColor: el.fill,
                        border: el.stroke ? `${el.strokeWidth ?? 1}px solid ${el.stroke}` : undefined,
                        borderRadius: el.shapeType === "circle" ? "50%" : undefined,
                      }}
                    />
                  )}
                  {el.type === "qrcode" && (
                    <div className="pointer-events-none flex h-full w-full items-center justify-center border border-zinc-200 bg-white">
                      <QrCode className="h-3/4 w-3/4 text-zinc-400" />
                    </div>
                  )}

                  {/* Resize handles for selected element */}
                  {selectedId === el.id && !dragState && (
                    <>
                      {(["nw", "ne", "sw", "se"] as const).map((handle) => (
                        <div
                          key={handle}
                          data-resize-handle="true"
                          className={cn(
                            "absolute z-10 h-2.5 w-2.5 rounded-full border-2 border-violet-500 bg-white shadow-sm",
                            handle === "nw" && "-left-1.5 -top-1.5 cursor-nwse-resize",
                            handle === "ne" && "-right-1.5 -top-1.5 cursor-nesw-resize",
                            handle === "sw" && "-left-1.5 -bottom-1.5 cursor-nesw-resize",
                            handle === "se" && "-right-1.5 -bottom-1.5 cursor-nwse-resize"
                          )}
                          onPointerDown={(e) => handleResizePointerDown(e, el, handle)}
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Properties */}
        {selectedElement && !showPreview && (
          <div className="w-56 shrink-0 border-l border-border overflow-y-auto p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Properties</p>
              <button
                onClick={() => {
                  setElements((prev) => prev.filter((el) => el.id !== selectedId));
                  setSelectedId(null);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {(selectedElement.type === "text" || selectedElement.type === "variable") && (
              <>
                {selectedElement.type === "text" && (
                  <div>
                    <label className="text-xs text-muted-foreground">Content</label>
                    <textarea
                      value={selectedElement.content ?? ""}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                      rows={2}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Font Size</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize ?? 16}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Font Weight</label>
                  <select
                    value={selectedElement.fontWeight ?? "normal"}
                    onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                    className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Color</label>
                  <input
                    type="color"
                    value={selectedElement.color ?? "#000000"}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    className="mt-0.5 h-7 w-full cursor-pointer rounded border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Align</label>
                  <select
                    value={selectedElement.textAlign ?? "center"}
                    onChange={(e) => updateElement(selectedElement.id, { textAlign: e.target.value })}
                    className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-muted-foreground">Position X (%)</label>
              <input
                type="number"
                value={selectedElement.x}
                onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Position Y (%)</label>
              <input
                type="number"
                value={selectedElement.y}
                onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Width (%)</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Height (%)</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                className="mt-0.5 h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>

            {/* Z-index / Layer controls */}
            <div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Layers className="h-3 w-3" /> Layer
              </label>
              <div className="mt-0.5 flex gap-1">
                <button
                  onClick={() => {
                    const maxZ = Math.max(...elements.map((e) => e.zIndex ?? 0));
                    updateElement(selectedElement.id, { zIndex: maxZ + 1 });
                  }}
                  className="flex-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                >
                  Bring Front
                </button>
                <button
                  onClick={() => {
                    const minZ = Math.min(...elements.map((e) => e.zIndex ?? 0));
                    updateElement(selectedElement.id, { zIndex: minZ - 1 });
                  }}
                  className="flex-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                >
                  Send Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
