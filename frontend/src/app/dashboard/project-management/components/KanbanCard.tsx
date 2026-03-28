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
import type { Task } from "@/lib/services/project/projectService";

interface KanbanCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isDragging?: boolean;
}

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

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: "primary" | "danger" | "warning" | "default" | "secondary" | "success"; label: string }
> = {
  feature:       { icon: <FiStar className="w-2.5 h-2.5" />,        color: "primary",   label: "Feature" },
  bugfix:        { icon: <FiAlertCircle className="w-2.5 h-2.5" />, color: "danger",    label: "Bug" },
  improvement:   { icon: <FiTool className="w-2.5 h-2.5" />,        color: "warning",   label: "Improve" },
  chore:         { icon: <FiPackage className="w-2.5 h-2.5" />,     color: "secondary", label: "Chore" },
  documentation: { icon: <FiFileText className="w-2.5 h-2.5" />,    color: "default",   label: "Docs" },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch { return ""; }
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function GripDotsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 16" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="2" cy="3" r="1.2" /><circle cx="6" cy="3" r="1.2" />
      <circle cx="2" cy="8" r="1.2" /><circle cx="6" cy="8" r="1.2" />
      <circle cx="2" cy="13" r="1.2" /><circle cx="6" cy="13" r="1.2" />
    </svg>
  );
}

export default function KanbanCard({ task, onClick, isDragging }: KanbanCardProps) {
  const priorityBorder = PRIORITY_BORDER[task.prioritas] ?? PRIORITY_BORDER.medium;
  const priorityDot = PRIORITY_DOT[task.prioritas] ?? PRIORITY_DOT.medium;
  const priorityLabel = PRIORITY_LABEL[task.prioritas] ?? "Medium";
  const type = typeConfig[task.tipe] ?? typeConfig.feature;
  const overdue = task.status !== "done" && isOverdue(task.due_date);

  return (
    <div
      onClick={(e) => {
        // Don't trigger click during drag
        if (isDragging) return;
        onClick?.(task);
      }}
      className={[
        "flex items-stretch gap-0",
        "bg-white dark:bg-slate-800",
        "rounded-xl overflow-hidden",
        "border border-gray-200/80 dark:border-slate-700/80",
        "shadow-sm",
        "transition-all duration-200 ease-out",
        // Hover — subtle lift (only when not dragging)
        !isDragging ? "hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-slate-600" : "",
        !isDragging ? "active:scale-[0.98]" : "",
        // Dragging (DragOverlay ghost)
        isDragging
          ? "shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/10 ring-2 ring-blue-400/40 dark:ring-blue-500/30 border-blue-300 dark:border-blue-600"
          : "",
        "cursor-grab active:cursor-grabbing",
        "select-none touch-manipulation",
        "group/card",
      ].join(" ")}
    >
      {/* Drag handle — visual indicator */}
      <div
        className={[
          "flex items-center justify-center w-5",
          "bg-gray-50/80 dark:bg-slate-700/40",
          "border-r border-gray-100 dark:border-slate-700/50",
          "opacity-30 sm:opacity-0 sm:group-hover/card:opacity-100",
          isDragging ? "opacity-100 bg-blue-50 dark:bg-blue-900/30" : "",
          "transition-all duration-150",
          "flex-shrink-0",
        ].join(" ")}
      >
        <GripDotsIcon className="w-2 h-4 text-gray-400 dark:text-slate-500" />
      </div>

      {/* Card body */}
      <div className={`flex-1 min-w-0 p-2.5 sm:p-3 ${priorityBorder}`}>
        {/* Row 1: Priority + Type + Code */}
        <div className="flex items-center justify-between mb-1.5 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot}`} title={priorityLabel} />
            <Chip size="sm" variant="flat" color={type.color} className="text-[10px] h-4 px-1.5 flex-shrink-0" startContent={type.icon}>
              {type.label}
            </Chip>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono flex-shrink-0">{task.kode}</span>
        </div>

        {/* Row 2: Title */}
        <h4 className="text-[13px] font-medium text-gray-900 dark:text-white line-clamp-2 mb-1.5 leading-snug">
          {task.judul}
        </h4>

        {/* Row 3: Module */}
        {task.module_name && (
          <div className="mb-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {task.module_name}
            </span>
          </div>
        )}

        {/* Row 4: Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {task.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md">{tag}</span>
            ))}
            {task.tags.length > 3 && <span className="px-1 py-0.5 text-[10px] text-gray-400">+{task.tags.length - 3}</span>}
          </div>
        )}

        {/* Row 5: Footer */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100/80 dark:border-slate-700/60 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {task.assignee_initial ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[#0B5EA8] text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0 ring-1 ring-white dark:ring-slate-700">
                  {task.assignee_initial}
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{task.assignee_name}</span>
              </>
            ) : (
              <span className="text-[10px] text-gray-400 dark:text-slate-500 italic">Unassigned</span>
            )}
          </div>
          {task.due_date && (
            <span className={[
              "text-[10px] flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-md font-medium",
              overdue ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse" : "text-gray-400 dark:text-slate-500",
            ].join(" ")}>
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
