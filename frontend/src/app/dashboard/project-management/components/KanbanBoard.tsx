"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { Task } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";

interface KanbanBoardProps {
  projectId: string;
  initialTasks: Record<string, Task[]>;
  onTaskClick?: (task: Task) => void;
}

const COLUMNS: { id: string; title: string }[] = [
  { id: "backlog",     title: "Backlog" },
  { id: "todo",        title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review",      title: "Review" },
  { id: "done",        title: "Done" },
  { id: "cancelled",   title: "Cancelled" },
];

function findColumnOfTask(columns: Record<string, Task[]>, taskId: string): string | null {
  for (const [colId, tasks] of Object.entries(columns)) {
    if (tasks.some((t) => t.id === taskId)) return colId;
  }
  return null;
}

export default function KanbanBoard({ projectId, initialTasks, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Task[]>>(
    COLUMNS.reduce((acc, col) => {
      acc[col.id] = initialTasks[col.id] ?? [];
      return acc;
    }, {} as Record<string, Task[]>)
  );

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  // Sensors: pointer (mouse) + touch with activation delay to prevent accidental drags
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // All task IDs for collision detection
  const taskIds = useMemo(
    () => Object.values(columns).flat().map((t) => t.id),
    [columns]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = Object.values(columns).flat().find((t) => t.id === taskId);
    setActiveTask(task ?? null);

    // Haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) { setOverColumnId(null); return; }

    const overId = over.id as string;

    // Check if over a column directly
    if (COLUMNS.some((c) => c.id === overId)) {
      setOverColumnId(overId);
      return;
    }

    // Over a task — find which column it's in
    const overCol = findColumnOfTask(columns, overId);
    if (overCol) setOverColumnId(overCol);

    // Move task between columns on hover (live preview)
    const activeCol = findColumnOfTask(columns, active.id as string);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const sourceItems = [...(prev[activeCol] ?? [])];
      const destItems = [...(prev[overCol] ?? [])];
      const activeIdx = sourceItems.findIndex((t) => t.id === active.id);
      if (activeIdx < 0) return prev;

      const [movedTask] = sourceItems.splice(activeIdx, 1);
      const updatedTask = { ...movedTask, status: overCol as Task["status"] };

      // Find insert position
      const overIdx = destItems.findIndex((t) => t.id === overId);
      if (overIdx >= 0) {
        destItems.splice(overIdx, 0, updatedTask);
      } else {
        destItems.push(updatedTask);
      }

      return {
        ...prev,
        [activeCol]: sourceItems,
        [overCol]: destItems,
      };
    });
  }, [columns]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumnId(null);

    // Haptic on drop
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([30, 20, 30]);
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfTask(columns, activeId);
    let overCol = COLUMNS.some((c) => c.id === overId) ? overId : findColumnOfTask(columns, overId);

    if (!activeCol || !overCol) return;

    // Reorder within same column
    if (activeCol === overCol) {
      const items = columns[activeCol] ?? [];
      const oldIdx = items.findIndex((t) => t.id === activeId);
      const newIdx = items.findIndex((t) => t.id === overId);
      if (oldIdx !== newIdx && newIdx >= 0) {
        const reordered = arrayMove(items, oldIdx, newIdx);
        setColumns((prev) => ({ ...prev, [activeCol]: reordered }));
      }
    }

    // Persist to backend
    const destItems = columns[overCol] ?? [];
    const reorderPayload = destItems.map((t, i) => ({
      task_id: t.id,
      status: overCol as Task["status"],
      posisi: i,
    }));

    try {
      await projectService.reorderTasks(projectId, reorderPayload);
    } catch (error) {
      console.error("Failed to reorder:", error);
    }
  }, [columns, projectId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Board container */}
      <div
        className={[
          "flex gap-3",
          "overflow-x-auto snap-x snap-mandatory",
          "pb-4 -mx-2 px-2",
          "lg:snap-none lg:mx-0 lg:px-0",
          "scroll-smooth",
          "[scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "dark:[&::-webkit-scrollbar-thumb]:bg-slate-600",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "min-h-[500px]",
        ].join(" ")}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={columns[col.id] ?? []}
            onTaskClick={onTaskClick}
            isOverColumn={overColumnId === col.id}
          />
        ))}
      </div>

      {/* ── DragOverlay: ghost card that follows cursor pixel-perfect ── */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}>
        {activeTask ? (
          <div className="w-[280px] rotate-[2deg] opacity-95">
            <KanbanCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
