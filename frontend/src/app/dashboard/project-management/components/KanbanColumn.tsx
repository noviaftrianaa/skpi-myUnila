"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import type { Task } from "@/lib/services/project/projectService";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  colorClass: string;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({ id, title, tasks, colorClass, onTaskClick }: KanbanColumnProps) {
  return (
    <div className={`flex-shrink-0 w-[280px] sm:w-72 rounded-xl ${colorClass} flex flex-col`}>
      {/* Column header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</span>
          <span className="text-xs font-medium bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 pt-1 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto
              transition-colors duration-150
              ${snapshot.isDraggingOver ? "bg-blue-100/50 dark:bg-blue-900/20 rounded-lg" : ""}
            `}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KanbanCard
                      task={task}
                      onClick={onTaskClick}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 text-xs text-gray-400 dark:text-gray-500">
                Tidak ada task
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
