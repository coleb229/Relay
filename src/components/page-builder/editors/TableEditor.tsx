"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PlusIcon,
  TrashIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ColumnsIcon,
} from "lucide-react";

interface TableColumn {
  header: string;
  align: "left" | "center" | "right";
}

interface TableConfig {
  heading: string;
  columns: TableColumn[];
  rows: string[][];
  showHeader: boolean;
  striped: boolean;
  bordered: boolean;
  hoverable: boolean;
  compact: boolean;
  caption: string;
}

interface TableEditorProps {
  config: TableConfig;
  onChange: (config: TableConfig) => void;
}

export function TableEditor({ config, onChange }: TableEditorProps) {
  function updateColumn(index: number, updates: Partial<TableColumn>) {
    const columns = [...config.columns];
    columns[index] = { ...columns[index], ...updates };
    onChange({ ...config, columns });
  }

  function addColumn() {
    const newCol: TableColumn = { header: "", align: "left" };
    const rows = config.rows.map((row) => [...row, ""]);
    onChange({
      ...config,
      columns: [...config.columns, newCol],
      rows,
    });
  }

  function removeColumn(index: number) {
    const columns = config.columns.filter((_, i) => i !== index);
    const rows = config.rows.map((row) => row.filter((_, i) => i !== index));
    onChange({ ...config, columns, rows });
  }

  function updateCell(rowIdx: number, colIdx: number, value: string) {
    const rows = config.rows.map((row) => [...row]);
    rows[rowIdx][colIdx] = value;
    onChange({ ...config, rows });
  }

  function addRow() {
    const emptyRow = config.columns.map(() => "");
    onChange({ ...config, rows: [...config.rows, emptyRow] });
  }

  function removeRow(index: number) {
    onChange({ ...config, rows: config.rows.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-1.5">
        <Label htmlFor="tbl-heading">Heading</Label>
        <Input
          id="tbl-heading"
          value={config.heading}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Optional table heading"
        />
      </div>

      {/* Columns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Columns</Label>
          <Button variant="outline" size="xs" onClick={addColumn}>
            <PlusIcon className="size-3" />
            Column
          </Button>
        </div>

        {config.columns.map((col, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className="rounded-lg border border-input p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Column {colIdx + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeColumn(colIdx)}
                aria-label={`Remove column ${colIdx + 1}`}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>

            <Input
              value={col.header}
              onChange={(e) => updateColumn(colIdx, { header: e.target.value })}
              placeholder="Header text"
              className="text-xs"
            />

            <ToggleGroup
              value={[col.align]}
              onValueChange={(values) => {
                if (values.length > 0) {
                  updateColumn(colIdx, {
                    align: values[0] as TableColumn["align"],
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeftIcon className="size-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenterIcon className="size-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRightIcon className="size-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ))}

        {config.columns.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add columns to start building your table.
          </p>
        )}
      </div>

      {/* Rows */}
      {config.columns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Rows ({config.rows.length})</Label>
            <Button variant="outline" size="xs" onClick={addRow}>
              <PlusIcon className="size-3" />
              Row
            </Button>
          </div>

          {config.rows.map((row, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="rounded-lg border border-input p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Row {rowIdx + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeRow(rowIdx)}
                  aria-label={`Remove row ${rowIdx + 1}`}
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>

              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${config.columns.length}, 1fr)`,
                }}
              >
                {config.columns.map((col, colIdx) => (
                  <Input
                    key={`cell-${rowIdx}-${colIdx}`}
                    value={row[colIdx] ?? ""}
                    onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                    placeholder={col.header || `Col ${colIdx + 1}`}
                    className="text-xs"
                  />
                ))}
              </div>
            </div>
          ))}

          {config.rows.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add rows to populate the table with data.
            </p>
          )}
        </div>
      )}

      {/* Style toggles */}
      <div className="space-y-2.5">
        <Label>Style Options</Label>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tbl-show-header"
            checked={config.showHeader}
            onCheckedChange={(checked) =>
              onChange({ ...config, showHeader: checked === true })
            }
          />
          <Label htmlFor="tbl-show-header" className="text-xs">
            Show header row
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tbl-striped"
            checked={config.striped}
            onCheckedChange={(checked) =>
              onChange({ ...config, striped: checked === true })
            }
          />
          <Label htmlFor="tbl-striped" className="text-xs">
            Striped rows
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tbl-bordered"
            checked={config.bordered}
            onCheckedChange={(checked) =>
              onChange({ ...config, bordered: checked === true })
            }
          />
          <Label htmlFor="tbl-bordered" className="text-xs">
            Bordered cells
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tbl-hoverable"
            checked={config.hoverable}
            onCheckedChange={(checked) =>
              onChange({ ...config, hoverable: checked === true })
            }
          />
          <Label htmlFor="tbl-hoverable" className="text-xs">
            Highlight on hover
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tbl-compact"
            checked={config.compact}
            onCheckedChange={(checked) =>
              onChange({ ...config, compact: checked === true })
            }
          />
          <Label htmlFor="tbl-compact" className="text-xs">
            Compact padding
          </Label>
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <Label htmlFor="tbl-caption">Caption</Label>
        <Input
          id="tbl-caption"
          value={config.caption}
          onChange={(e) => onChange({ ...config, caption: e.target.value })}
          placeholder="Optional table caption"
        />
      </div>
    </div>
  );
}
