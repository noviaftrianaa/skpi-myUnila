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

const COLUMNS: { id: Task['status']; title: string; colorClass: string }[] = [
  {
    id: "backlog",
    title: "Backlog",
    colorClass: "bg-slate-50 dark:bg-slate-900/40 border-l-4 border-slate-400",
  },
  {
    id: "todo",
    title: "To Do",
    colorClass: "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400",
  },
  {
    id: "in_progress",
    title: "In Progress",
    colorClass: "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400",
  },
  {
    id: "review",
    title: "Review",
    colorClass: "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400",
  },
  {
    id: "done",
    title: "Done",
    colorClass: "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400",
  },
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
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Save previous state for rollback
    const previousColumns = { ...columns };

    // Optimistic update
    const sourceCol = [...(columns[source.droppableId] ?? [])];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...(columns[destination.droppableId] ?? [])];

    const [movedTask] = sourceCol.splice(source.index, 1);
    const updatedTask: Task = { ...movedTask, status: destination.droppableId as Task['status'] };

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, updatedTask);
      setColumns(prev => ({ ...prev, [source.droppableId]: sourceCol }));
    } else {
      destCol.splice(destination.index, 0, updatedTask);
      setColumns(prev => ({
        ...prev,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      }));
    }

    // Build reorder payload
    const reorderItems = destCol.map((t, i) => ({
      task_id: t.id,
      status: destination.droppableId as Task['status'],
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
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={columns[col.id] ?? []}
            colorClass={col.colorClass}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
