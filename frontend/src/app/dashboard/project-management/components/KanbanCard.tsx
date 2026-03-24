"use client";

import { Chip } from "./ui";
import {
  FiStar,
  FiAlertCircle,
  FiTool,
  FiPackage,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import type { Task } from "@/lib/services/project/projectService";

interface KanbanCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

// ── Priority: left-border colour + label ───────────────────────────────────
const PRIORITY_BORDER: Record<string, string> = {
  urgent: "border-l-[3px] border-l-red-500",
  high:   "border-l-[3px] border-l-orange-500",
  medium: "border-l-[3px] border-l-yellow-400",
  low:    "border-l-[3px] border-l-green-400",
};
const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high:   "bg-orange-500",
  medium: "bg-yellow-400",
  low:    "bg-green-400",
};
const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent",
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

// ── Type chip ──────────────────────────────────────────────────────────────
const typeConfig: Record<
  string,
  {
    icon: React.ReactNode;
    color: "primary" | "danger" | "warning" | "default" | "secondary" | "success";
    label: string;
  }
> = {
  feature: {
    icon: <FiStar className="w-2.5 h-2.5" />,
    color: "primary",
    label: "Feature",
  },
  bugfix: {
    icon: <FiAlertCircle className="w-2.5 h-2.5" />,
    color: "danger",
    label: "Bug",
  },
  improvement: {
    icon: <FiTool className="w-2.5 h-2.5" />,
    color: "warning",
    label: "Improvement",
  },
  chore: {
    icon: <FiPackage className="w-2.5 h-2.5" />,
    color: "secondary",
    label: "Chore",
  },
  documentation: {
    icon: <FiFileText className="w-2.5 h-2.5" />,
    color: "default",
    label: "Docs",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = [
      "Jan","Feb","Mar","Apr","Mei","Jun",
      "Jul","Agu","Sep","Okt","Nov","Des",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return "";
  }
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ── Grip-dots icon (drag handle visual) ───────────────────────────────────
function GripDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="2" cy="3"  r="1.2" />
      <circle cx="6" cy="3"  r="1.2" />
      <circle cx="2" cy="8"  r="1.2" />
      <circle cx="6" cy="8"  r="1.2" />
      <circle cx="2" cy="13" r="1.2" />
      <circle cx="6" cy="13" r="1.2" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function KanbanCard({
  task,
  onClick,
  isDragging,
  dragHandleProps,
}: KanbanCardProps) {
  const priorityBorder = PRIORITY_BORDER[task.prioritas] ?? PRIORITY_BORDER.medium;
  const priorityDot    = PRIORITY_DOT[task.prioritas]    ?? PRIORITY_DOT.medium;
  const priorityLabel  = PRIORITY_LABEL[task.prioritas]  ?? "Medium";
  const type           = typeConfig[task.tipe]           ?? typeConfig.feature;
  const overdue        = task.status !== "done" && isOverdue(task.due_date);

  return (
    <div
      onClick={() => onClick?.(task)}
      className={[
        // layout
        "flex items-stretch gap-0",
        "bg-white dark:bg-slate-800",
        "rounded-xl",
        "border border-gray-200 dark:border-slate-700",
        // priority left border applied on the inner content area
        "overflow-hidden",
        // shadow & scale on hover / drag
        "shadow-sm",
        "hover:shadow-md hover:scale-[1.015]",
        "active:scale-[0.99]",
        "transition-all duration-150 ease-out",
        // dragging state
        isDragging
          ? "shadow-2xl scale-[1.03] rotate-1 opacity-95 ring-2 ring-[#0B5EA8]/30"
          : "",
        "cursor-pointer select-none",
        "group",
      ].join(" ")}
    >
      {/* ── Drag handle strip ─────────────────────────────────────────── */}
      <div
        {...(dragHandleProps ?? {})}
        className={[
          "flex items-center justify-center px-1.5",
          "bg-gray-50 dark:bg-slate-700/60",
          "border-r border-gray-100 dark:border-slate-700",
          "opacity-0 group-hover:opacity-100",
          isDragging ? "opacity-100" : "",
          "transition-opacity duration-150",
          "cursor-grab active:cursor-grabbing",
          "flex-shrink-0",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <GripDotsIcon className="w-2 h-4 text-gray-400 dark:text-slate-500" />
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div
        className={[
          "flex-1 min-w-0 p-3",
          // priority left border
          priorityBorder,
        ].join(" ")}
      >
        {/* Row 1: Priority dot + Type chip + Task code */}
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot}`}
              title={priorityLabel}
            />
            <Chip
              size="sm"
              variant="flat"
              color={type.color}
              className="text-[10px] h-4 px-1.5 flex-shrink-0"
              startContent={type.icon}
            >
              {type.label}
            </Chip>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono flex-shrink-0">
            {task.kode}
          </span>
        </div>

        {/* Row 2: Title */}
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 leading-snug">
          {task.judul}
        </h4>

        {/* Row 3: Module chip (if available) */}
        {task.module_name && (
          <div className="mb-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {task.module_name}
            </span>
          </div>
        )}

        {/* Row 4: Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Row 5: Footer — assignee + due date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700 gap-1">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 min-w-0">
            {task.assignee_initial ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[#0B5EA8] text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0 ring-1 ring-white dark:ring-slate-700">
                  {task.assignee_initial}
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                  {task.assignee_name}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-gray-400 dark:text-slate-500 italic">
                Unassigned
              </span>
            )}
          </div>

          {/* Due date */}
          {task.due_date && (
            <span
              className={[
                "text-[10px] flex items-center gap-0.5 flex-shrink-0",
                "px-1.5 py-0.5 rounded-md font-medium",
                overdue
                  ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                  : "text-gray-400 dark:text-slate-500",
              ].join(" ")}
            >
              <FiCalendar className="w-2.5 h-2.5" />
              {formatDate(task.due_date)}
              {overdue && <span className="ml-0.5">!</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
