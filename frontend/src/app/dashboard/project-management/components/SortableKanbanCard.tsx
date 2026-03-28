"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import KanbanCard from "./KanbanCard";
import type { Task } from "@/lib/services/project/projectService";

interface SortableKanbanCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

export default function SortableKanbanCard({ task, onTaskClick }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
    // Fade out the original card when dragging (DragOverlay shows the ghost)
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 0 : "auto" as number | string,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard
        task={task}
        onClick={onTaskClick}
        isDragging={isDragging}
      />
    </div>
  );
}
