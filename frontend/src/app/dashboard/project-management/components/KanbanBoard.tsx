"use client";

import { useState, useCallback, useRef } from "react";
import {
  DragDropContext,
  DropResult,
  DragStart,
  DragUpdate,
  BeforeCapture,
} from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { Task } from "@/lib/services/project/projectService";
import { projectService } from "@/lib/services/project/projectService";
import { createPortal } from "react-dom";

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

  // Track the dragging task for overlay
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((start: DragStart) => {
    const task = Object.values(columns)
      .flat()
      .find((t) => t.id === start.draggableId);
    setDraggingTask(task ?? null);
    setSourceColumnId(start.source.droppableId);

    // Add haptic feedback on mobile
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    // Prevent body scroll on mobile during drag
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }, [columns]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination } = result;

    // Re-enable body scroll
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    setDraggingTask(null);
    setSourceColumnId(null);

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Haptic feedback on drop
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([30, 20, 30]);
    }

    const previousColumns = { ...columns };

    const sourceCol = [...(columns[source.droppableId] ?? [])];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...(columns[destination.droppableId] ?? [])];

    const [movedTask] = sourceCol.splice(source.index, 1);
    const updatedTask: Task = { ...movedTask, status: destination.droppableId as Task["status"] };

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

    const reorderItems = destCol.map((t, i) => ({
      task_id: t.id,
      status: destination.droppableId as Task["status"],
      posisi: i,
    }));

    try {
      await projectService.reorderTasks(projectId, reorderItems);
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      setColumns(previousColumns);
    }
  }, [columns, projectId]);

  // Auto-scroll when dragging near board edges
  const handleDragUpdate = useCallback((update: DragUpdate) => {
    if (!scrollRef.current || !update.destination) return;
    const el = scrollRef.current;
    const rect = el.getBoundingClientRect();
    const edgeZone = 100;

    // Get mouse position from the dragging element
    const destIdx = COLUMNS.findIndex((c) => c.id === update.destination?.droppableId);
    if (destIdx < 0) return;

    const colWidth = 300;
    const approxX = destIdx * colWidth;

    if (approxX < el.scrollLeft + edgeZone) {
      el.scrollBy({ left: -120, behavior: "smooth" });
    } else if (approxX > el.scrollLeft + rect.width - edgeZone) {
      el.scrollBy({ left: 120, behavior: "smooth" });
    }
  }, []);

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragUpdate={handleDragUpdate}
    >
      {/* Board container */}
      <div
        ref={scrollRef}
        className={[
          "flex gap-3",
          // Mobile: horizontal scroll with snap
          "overflow-x-auto snap-x snap-mandatory",
          "pb-4 -mx-2 px-2",
          // Desktop: row layout
          "lg:snap-none lg:mx-0 lg:px-0",
          // Scrollbar
          "scroll-smooth",
          "[scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "dark:[&::-webkit-scrollbar-thumb]:bg-slate-600",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          // Height
          "min-h-[500px]",
          // Transition
          draggingTask ? "cursor-grabbing" : "",
        ].join(" ")}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={columns[col.id] ?? []}
            onTaskClick={onTaskClick}
            isDragSource={sourceColumnId === col.id}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
