"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableKanbanCard from "./SortableKanbanCard";
import type { Task } from "@/lib/services/project/projectService";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const STATUS_STYLE: Record<string, {
  header: string; accent: string; dot: string; badge: string; column: string; dropRing: string;
}> = {
  backlog:     { header: "bg-slate-100 dark:bg-slate-800",     accent: "border-l-4 border-slate-400 dark:border-slate-500",   dot: "bg-slate-400",   badge: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",     column: "bg-slate-50 dark:bg-slate-900/50",     dropRing: "ring-slate-400/50" },
  todo:        { header: "bg-blue-50 dark:bg-blue-950/60",     accent: "border-l-4 border-blue-400 dark:border-blue-500",     dot: "bg-blue-400",    badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",      column: "bg-blue-50/50 dark:bg-blue-950/30",    dropRing: "ring-blue-400/50" },
  in_progress: { header: "bg-amber-50 dark:bg-amber-950/60",   accent: "border-l-4 border-amber-400 dark:border-amber-500",   dot: "bg-amber-400",   badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",  column: "bg-amber-50/50 dark:bg-amber-950/30",  dropRing: "ring-amber-400/50" },
  review:      { header: "bg-purple-50 dark:bg-purple-950/60", accent: "border-l-4 border-purple-400 dark:border-purple-500", dot: "bg-purple-400",  badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300", column: "bg-purple-50/50 dark:bg-purple-950/30", dropRing: "ring-purple-400/50" },
  done:        { header: "bg-emerald-50 dark:bg-emerald-950/60", accent: "border-l-4 border-emerald-400 dark:border-emerald-500", dot: "bg-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300", column: "bg-emerald-50/50 dark:bg-emerald-950/30", dropRing: "ring-emerald-400/50" },
  cancelled:   { header: "bg-red-50 dark:bg-red-950/60",       accent: "border-l-4 border-red-400 dark:border-red-500",       dot: "bg-red-400",     badge: "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300",          column: "bg-red-50/50 dark:bg-red-950/30",      dropRing: "ring-red-400/50" },
};

const FALLBACK = STATUS_STYLE.backlog;

export default function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const style = STATUS_STYLE[id] ?? FALLBACK;

  // Make column a droppable target — key for cross-column drops
  const { setNodeRef, isOver } = useDroppable({ id });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={[
        "flex-shrink-0 flex flex-col rounded-xl overflow-hidden",
        "w-[85vw] min-w-[280px] sm:w-[320px] lg:min-w-[260px] lg:max-w-[300px] lg:w-auto lg:flex-1",
        "snap-center",
        style.column, style.accent,
        "shadow-sm",
        "transition-all duration-200 ease-out",
        // Glow when something is dragged over this column
        isOver ? `ring-2 ring-inset ${style.dropRing} scale-[1.01] brightness-105` : "",
      ].join(" ")}
    >
      {/* Header */}
      <div className={`px-3 py-2.5 ${style.header}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-100 truncate">{title}</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Sortable drop zone */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={[
            "flex-1 p-2 space-y-2",
            "min-h-[120px] lg:min-h-[200px]",
            "max-h-[60vh] lg:max-h-[calc(100vh-260px)]",
            "overflow-y-auto",
            "[scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
          ].join(" ")}
        >
          {tasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className={[
              "flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed transition-all duration-200",
              isOver
                ? "border-blue-400/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-500"
                : "border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500",
            ].join(" ")}>
              <svg className="w-5 h-5 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-[11px] font-medium">
                {isOver ? "Lepas di sini" : "Drag task ke sini"}
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
