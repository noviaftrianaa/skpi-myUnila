"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
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

const COLUMN_IDS = new Set(COLUMNS.map((c) => c.id));

export default function KanbanBoard({ projectId, initialTasks, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Task[]>>(() =>
    COLUMNS.reduce((acc, col) => {
      acc[col.id] = initialTasks[col.id] ?? [];
      return acc;
    }, {} as Record<string, Task[]>)
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const prevColumnsRef = useRef<Record<string, Task[]>>(columns);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Find which column a task or column ID belongs to
  const findContainer = useCallback((id: UniqueIdentifier): string | null => {
    // If it's a column ID itself
    if (COLUMN_IDS.has(id as string)) return id as string;
    // Find which column contains this task
    for (const [colId, tasks] of Object.entries(columns)) {
      if (tasks.some((t) => t.id === id)) return colId;
    }
    return null;
  }, [columns]);

  // Get the active task object
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return Object.values(columns).flat().find((t) => t.id === activeId) ?? null;
  }, [activeId, columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    prevColumnsRef.current = JSON.parse(JSON.stringify(columns));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(50);
  }, [columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Move task from one column to another
    setColumns((prev) => {
      const activeItems = [...(prev[activeContainer] ?? [])];
      const overItems = [...(prev[overContainer] ?? [])];

      const activeIdx = activeItems.findIndex((t) => t.id === active.id);
      if (activeIdx < 0) return prev;

      // Remove from source
      const [movedTask] = activeItems.splice(activeIdx, 1);
      const updatedTask = { ...movedTask, status: overContainer as Task["status"] };

      // Find insert position in destination
      const overIdx = overItems.findIndex((t) => t.id === over.id);
      if (overIdx >= 0) {
        overItems.splice(overIdx, 0, updatedTask);
      } else {
        // Dropped on column itself (not on a card) — add to end
        overItems.push(updatedTask);
      }

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  }, [findContainer]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([30, 20, 30]);

    if (!over) {
      // Cancelled — rollback
      setColumns(prevColumnsRef.current);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) {
      setColumns(prevColumnsRef.current);
      return;
    }

    // Same column — reorder
    if (activeContainer === overContainer) {
      const items = columns[activeContainer] ?? [];
      const oldIdx = items.findIndex((t) => t.id === active.id);
      const newIdx = items.findIndex((t) => t.id === over.id);

      if (oldIdx !== newIdx && newIdx >= 0) {
        setColumns((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer] ?? [], oldIdx, newIdx),
        }));
      }
    }

    // Persist to backend
    const destItems = columns[overContainer] ?? [];
    const reorderPayload = destItems.map((t, i) => ({
      task_id: t.id,
      status: overContainer as Task["status"],
      posisi: i,
    }));

    try {
      await projectService.reorderTasks(projectId, reorderPayload);
    } catch (error) {
      console.error("Failed to reorder:", error);
      // Rollback on error
      setColumns(prevColumnsRef.current);
    }
  }, [columns, findContainer, projectId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
          />
        ))}
      </div>

      {/* DragOverlay — ghost card that follows cursor via React Portal */}
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeTask ? (
          <div className="w-[280px] rotate-[2deg] scale-105 opacity-95 pointer-events-none">
            <KanbanCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
