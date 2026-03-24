"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Btn,
  Spinner,
  TwInput,
  TwSelect,
  Chip,
} from "../../components/ui";
import { FiPlus, FiSearch, FiFilter, FiLayout, FiSettings, FiBarChart2 } from "react-icons/fi";
import { FiFolder } from "react-icons/fi";
import Link from "next/link";
import KanbanBoard from "../../components/KanbanBoard";
import TaskDetailModal from "../../components/TaskDetailModal";
import TaskCreateModal from "../../components/TaskCreateModal";
import {
  projectService,
  type Project,
  type Task,
  type ProjectModule,
} from "@/lib/services/project/projectService";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [boardTasks, setBoardTasks] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (!projectId) return;
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proj, mods, tasks] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getModules(projectId),
        projectService.getTasksByStatus(projectId),
      ]);
      setProject(proj);
      setModules(mods);
      setBoardTasks(tasks);
    } catch (error) {
      console.error("Error loading board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (tasks: Record<string, Task[]>): Record<string, Task[]> => {
    const result: Record<string, Task[]> = {};
    for (const [status, list] of Object.entries(tasks)) {
      result[status] = list.filter(t => {
        const matchSearch = !searchQuery ||
          t.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.kode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchModule = moduleFilter === "all" || t.module_id === moduleFilter;
        const matchPriority = priorityFilter === "all" || t.prioritas === priorityFilter;
        return matchSearch && matchModule && matchPriority;
      });
    }
    return result;
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdated = (updated: Task) => {
    setBoardTasks(prev => {
      const next: Record<string, Task[]> = {};
      for (const [status, list] of Object.entries(prev)) {
        next[status] = list.filter(t => t.id !== updated.id);
      }
      const col = updated.status;
      next[col] = [updated, ...(next[col] ?? [])];
      return next;
    });
    setSelectedTask(updated);
  };

  const handleTaskCreated = (task: Task) => {
    setBoardTasks(prev => ({
      ...prev,
      [task.status]: [task, ...(prev[task.status] ?? [])],
    }));
  };

  const moduleOptions = [
    { value: "all", label: "Semua Modul" },
    ...modules.map(m => ({ value: m.id, label: m.nama })),
  ];

  const priorityOptions = [
    { value: "all", label: "Semua Prioritas" },
    { value: "urgent", label: "🔴 Urgent" },
    { value: "high", label: "🟠 High" },
    { value: "medium", label: "🟡 Medium" },
    { value: "low", label: "🟢 Low" },
  ];

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        </>
);
  }

  const filteredTasks = applyFilters(boardTasks);
  const totalTasks = Object.values(boardTasks).reduce((s, l) => s + l.length, 0);

  return (
      <>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiLayout className="w-5 h-5 text-[#0B5EA8]" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Kanban Board</h1>
              <Chip size="sm" color="default" className="text-xs">{totalTasks} task</Chip>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Btn
                size="sm"
                variant="primary"
                className="text-xs"
                startContent={<FiPlus className="w-3.5 h-3.5" />}
                onClick={() => setIsCreateOpen(true)}
              >
                Buat Task
              </Btn>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <FiFilter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
            <TwInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Cari task..."
              inputSize="sm"
              className="w-full sm:w-48"
            />
            <TwSelect
              value={moduleFilter}
              onValueChange={(v) => setModuleFilter(v)}
              options={moduleOptions}
              selectSize="sm"
              className="w-full sm:w-40"
            />
            <TwSelect
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v)}
              options={priorityOptions}
              selectSize="sm"
              className="w-full sm:w-40"
            />
            {(searchQuery || moduleFilter !== "all" || priorityFilter !== "all") && (
              <Btn
                size="sm"
                variant="danger"
                className="text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setModuleFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Reset
              </Btn>
            )}
          </div>

          {/* Kanban Board */}
          <KanbanBoard
            projectId={projectId}
            initialTasks={filteredTasks}
            onTaskClick={handleTaskClick}
          />
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          modules={modules}
          onTaskUpdated={handleTaskUpdated}
        />

        {/* Task Create Modal */}
        <TaskCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          projectId={projectId}
          modules={modules}
          onCreated={handleTaskCreated}
        />
      </>
);
}
