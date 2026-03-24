"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Spinner,
  Input,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
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

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" color="primary" />
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
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href="/dashboard/project-management"
                  className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
                >
                  Project Management
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {project?.nama ?? "..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiLayout className="w-5 h-5 text-[#0B5EA8]" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
                <Chip size="sm" variant="flat" className="text-xs">{totalTasks} task</Chip>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/project-management/${projectId}/list`}>
                <Button size="sm" variant="bordered" className="text-xs">
                  Tampilan List
                </Button>
              </Link>
              <Link href={`/dashboard/project-management/${projectId}/timeline`}>
                <Button size="sm" variant="bordered" className="text-xs" startContent={<FiBarChart2 className="w-3.5 h-3.5" />}>
                  Timeline
                </Button>
              </Link>
              <Link href={`/dashboard/project-management/${projectId}/documents`}>
                <Button size="sm" variant="bordered" className="text-xs" startContent={<FiFolder className="w-3.5 h-3.5" />}>
                  Dokumen
                </Button>
              </Link>
              <Link href={`/dashboard/project-management/${projectId}/settings`}>
                <Button size="sm" variant="bordered" className="text-xs" startContent={<FiSettings className="w-3.5 h-3.5" />}>
                  Pengaturan
                </Button>
              </Link>
              <Button
                size="sm"
                color="primary"
                className="bg-[#0B5EA8] text-white text-xs"
                startContent={<FiPlus className="w-3.5 h-3.5" />}
                onPress={() => setIsCreateOpen(true)}
              >
                Buat Task
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <FiFilter className="w-4 h-4 text-gray-400 shrink-0" />
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Cari task..."
              startContent={<FiSearch className="w-3.5 h-3.5 text-gray-400" />}
              variant="bordered"
              size="sm"
              className="w-48"
            />
            <Select
              selectedKeys={new Set([moduleFilter])}
              onSelectionChange={(keys) => setModuleFilter(Array.from(keys)[0] as string ?? "all")}
              variant="bordered"
              size="sm"
              placeholder="Semua Modul"
              className="w-40"
              items={[{ id: "all", nama: "Semua Modul" }, ...modules]}
            >
              {(m) => <SelectItem key={m.id}>{m.nama}</SelectItem>}
            </Select>
            <Select
              selectedKeys={new Set([priorityFilter])}
              onSelectionChange={(keys) => setPriorityFilter(Array.from(keys)[0] as string ?? "all")}
              variant="bordered"
              size="sm"
              placeholder="Semua Prioritas"
              className="w-40"
            >
              <SelectItem key="all">Semua Prioritas</SelectItem>
              <SelectItem key="urgent">🔴 Urgent</SelectItem>
              <SelectItem key="high">🟠 High</SelectItem>
              <SelectItem key="medium">🟡 Medium</SelectItem>
              <SelectItem key="low">🟢 Low</SelectItem>
            </Select>
            {(searchQuery || moduleFilter !== "all" || priorityFilter !== "all") && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="text-xs"
                onPress={() => {
                  setSearchQuery("");
                  setModuleFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Reset
              </Button>
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
