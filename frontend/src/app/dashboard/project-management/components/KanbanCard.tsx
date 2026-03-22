"use client";

import { Chip } from "@heroui/react";
import { FiStar, FiAlertCircle, FiTool, FiPackage, FiFileText, FiCalendar } from "react-icons/fi";
import type { Task } from "@/lib/services/project/projectService";

interface KanbanCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isDragging?: boolean;
}

const priorityConfig: Record<string, { dot: string; label: string }> = {
  urgent: { dot: "bg-red-500", label: "Urgent" },
  high: { dot: "bg-orange-500", label: "High" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  low: { dot: "bg-green-500", label: "Low" },
};

const typeConfig: Record<string, { icon: React.ReactNode; color: "primary" | "danger" | "warning" | "default" | "secondary" | "success"; label: string }> = {
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${months[d.getMonth()]}`;
  } catch {
    return "";
  }
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function KanbanCard({ task, onClick, isDragging }: KanbanCardProps) {
  const priority = priorityConfig[task.prioritas] ?? priorityConfig.medium;
  const type = typeConfig[task.tipe] ?? typeConfig.feature;
  const overdue = task.status !== 'done' && isOverdue(task.due_date);

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 
        p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group
        ${isDragging ? "shadow-xl rotate-1 scale-105 opacity-90" : ""}
        ${overdue ? "border-l-2 border-l-red-400" : ""}
      `}
    >
      {/* Priority + Type + Code */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* Priority dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} title={priority.label} />
          {/* Type badge */}
          <Chip
            size="sm"
            variant="flat"
            color={type.color}
            className="text-[10px] h-4 px-1.5"
            startContent={type.icon}
          >
            {type.label}
          </Chip>
        </div>
        <span className="text-[10px] text-gray-400 font-mono shrink-0">{task.kode}</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 leading-tight">
        {task.judul}
      </h4>

      {/* Tags */}
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {task.assignee_initial ? (
            <>
              <div className="w-5 h-5 rounded-full bg-[#0B5EA8] text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                {task.assignee_initial}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[60px]">
                {task.assignee_name}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Due date */}
        {task.due_date && (
          <span className={`text-[10px] flex items-center gap-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`}>
            <FiCalendar className="w-2.5 h-2.5" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
