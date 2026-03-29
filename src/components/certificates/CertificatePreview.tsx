"use client";

import { cn } from "@/lib/utils";
import { Award } from "lucide-react";

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
  elements?: DesignElement[];
  background?: { color?: string; imageUrl?: string };
  dimensions?: { width: number; height: number };
}

interface CertificatePreviewProps {
  designData?: DesignData;
  variables?: Record<string, string | null>;
  orientation?: "LANDSCAPE" | "PORTRAIT";
  backgroundColor?: string | null;
  borderStyle?: string | null;
  logoUrl?: string | null;
  className?: string;
  compact?: boolean;
}

const borderStyles: Record<string, string> = {
  classic: "border-4 border-double border-amber-600/50",
  modern: "border-2 border-violet-500/30",
  minimal: "border border-zinc-300 dark:border-zinc-600",
  none: "",
};

function resolveVariable(name: string, variables?: Record<string, string | null>): string {
  if (!variables) return `{{${name}}}`;
  return variables[name] ?? `{{${name}}}`;
}

export function CertificatePreview({
  designData,
  variables,
  orientation = "LANDSCAPE",
  backgroundColor,
  borderStyle = "classic",
  logoUrl,
  className,
  compact = false,
}: CertificatePreviewProps) {
  const isLandscape = orientation === "LANDSCAPE";
  const aspectClass = isLandscape ? "aspect-[4/3]" : "aspect-[3/4]";
  const border = borderStyles[borderStyle ?? "classic"] ?? "";
  const hasElements = designData?.elements && designData.elements.length > 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg shadow-sm",
        aspectClass,
        border,
        className
      )}
      style={{
        backgroundColor: backgroundColor ?? designData?.background?.color ?? "#ffffff",
      }}
    >
      {designData?.background?.imageUrl && (
        <img
          src={designData.background.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {hasElements ? (
        <div className="relative h-full w-full">
          {designData!.elements!.map((el) => (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                zIndex: el.zIndex ?? 0,
              }}
            >
              {el.type === "text" && (
                <p
                  style={{
                    fontSize: compact ? `${(el.fontSize ?? 16) * 0.5}px` : `${el.fontSize ?? 16}px`,
                    fontFamily: el.fontFamily ?? "inherit",
                    fontWeight: el.fontWeight ?? "normal",
                    color: el.color ?? "#000",
                    textAlign: (el.textAlign as React.CSSProperties["textAlign"]) ?? "left",
                  }}
                  className="leading-tight"
                >
                  {el.content}
                </p>
              )}
              {el.type === "variable" && (
                <p
                  style={{
                    fontSize: compact ? `${(el.fontSize ?? 16) * 0.5}px` : `${el.fontSize ?? 16}px`,
                    fontFamily: el.fontFamily ?? "inherit",
                    fontWeight: el.fontWeight ?? "bold",
                    color: el.color ?? "#000",
                    textAlign: (el.textAlign as React.CSSProperties["textAlign"]) ?? "center",
                  }}
                  className="leading-tight"
                >
                  {resolveVariable(el.variableName ?? "", variables)}
                </p>
              )}
              {el.type === "image" && el.src && (
                <img src={el.src} alt="" className="h-full w-full object-contain" />
              )}
              {el.type === "shape" && (
                <div
                  className="h-full w-full"
                  style={{
                    backgroundColor: el.fill ?? "transparent",
                    border: el.stroke ? `${el.strokeWidth ?? 1}px solid ${el.stroke}` : undefined,
                    borderRadius: el.shapeType === "circle" ? "50%" : undefined,
                  }}
                />
              )}
              {el.type === "qrcode" && (
                <div className="flex h-full w-full items-center justify-center bg-white p-1">
                  <div className="grid grid-cols-5 grid-rows-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn("aspect-square", Math.random() > 0.4 ? "bg-zinc-900" : "bg-white")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Default certificate layout when no custom elements
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className={cn("mb-1 object-contain", compact ? "h-6" : "h-12")} />
          )}
          {!logoUrl && (
            <div className={cn("flex items-center justify-center rounded-full bg-violet-500/15", compact ? "h-8 w-8" : "h-14 w-14")}>
              <Award className={cn("text-violet-600", compact ? "h-4 w-4" : "h-7 w-7")} />
            </div>
          )}
          <div className={cn("font-semibold tracking-wide text-zinc-800 uppercase", compact ? "text-[6px]" : "text-xs")}>
            Certificate of Completion
          </div>
          <div className={cn("font-bold text-zinc-900", compact ? "text-[8px]" : "text-lg")}>
            {resolveVariable("studentName", variables)}
          </div>
          <div className={cn("text-zinc-600", compact ? "text-[5px]" : "text-[10px]")}>
            has successfully completed
          </div>
          <div className={cn("font-semibold text-violet-700", compact ? "text-[7px]" : "text-sm")}>
            {resolveVariable("courseTitle", variables)}
          </div>
          <div className={cn("mt-1 text-zinc-500", compact ? "text-[4px]" : "text-[9px]")}>
            {resolveVariable("completionDate", variables)}
          </div>
        </div>
      )}
    </div>
  );
}
