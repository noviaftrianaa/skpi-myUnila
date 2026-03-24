"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
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

export default function KanbanBoard({ projectId, initialTasks, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<string, Task[]>>(
    COLUMNS.reduce((acc, col) => {
      acc[col.id] = initialTasks[col.id] ?? [];
      return acc;
    }, {} as Record<string, Task[]>)
  );

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Save previous state for rollback
    const previousColumns = { ...columns };

    // Optimistic update
    const sourceCol = [...(columns[source.droppableId] ?? [])];
    const destCol =
      source.droppableId === destination.droppableId
        ? sourceCol
        : [...(columns[destination.droppableId] ?? [])];

    const [movedTask] = sourceCol.splice(source.index, 1);
    const updatedTask: Task = {
      ...movedTask,
      status: destination.droppableId as Task["status"],
    };

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, updatedTask);
      setColumns((prev) => ({ ...prev, [source.droppableId]: sourceCol }));
    } else {
      destCol.splice(destination.index, 0, updatedTask);
      setColumns((prev) => ({
        ...prev,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      }));
    }

    // Build reorder payload
    const reorderItems = destCol.map((t, i) => ({
      task_id: t.id,
      status: destination.droppableId as Task["status"],
      posisi: i,
    }));

    try {
      await projectService.reorderTasks(projectId, reorderItems);
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      // Rollback
      setColumns(previousColumns);
    }
  }, [columns, projectId]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Horizontal scroll board — single col on mobile, row on desktop */}
      <div
        className={[
          "flex flex-col lg:flex-row",
          "gap-4 pb-4",
          "overflow-x-auto",
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
    </DragDropContext>
  );
}
