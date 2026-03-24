"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { Btn, Chip, Spinner, TwSelect } from "../../components/ui";
import { FiPlus, FiList, FiBarChart2 } from "react-icons/fi";
import Link from "next/link";
import TaskDetailModal from "../../components/TaskDetailModal";
import TaskCreateModal from "../../components/TaskCreateModal";
import {
  projectService,
  type Project,
  type Task,
  type ProjectModule,
} from "@/lib/services/project/projectService";

const STATUS_CHIP: Record<string, { label: string; color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  backlog: { label: "Backlog", color: "default" },
  todo: { label: "To Do", color: "primary" },
  in_progress: { label: "In Progress", color: "warning" },
  review: { label: "Review", color: "secondary" },
  done: { label: "Done", color: "success" },
  cancelled: { label: "Dibatalkan", color: "danger" },
};

const PRIORITAS_CHIP: Record<string, { label: string; color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  urgent: { label: "Urgent", color: "danger" },
  high: { label: "High", color: "warning" },
  medium: { label: "Medium", color: "primary" },
  low: { label: "Low", color: "success" },
};

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function TaskListPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (!projectId) return;
    loadInitialData();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    loadTasks();
  }, [projectId, currentPage, moduleFilter, statusFilter, priorityFilter]);

  const loadInitialData = async () => {
    try {
      const [proj, mods] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getModules(projectId),
      ]);
      setProject(proj);
      setModules(mods);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await projectService.getTasks(projectId, {
        page: currentPage,
        per_page: 15,
        module_id: moduleFilter !== "all" ? moduleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        prioritas: priorityFilter !== "all" ? priorityFilter : undefined,
      });
      setTasks(res.data);
      setTotalRecords(res.meta.total);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const columns: Column<Task>[] = [
    {
      key: "kode",
      label: "Kode",
      width: "110px",
      render: (item) => (
        <span className="text-xs font-mono text-[#0B5EA8] dark:text-blue-400 font-semibold">
          {item.kode}
        </span>
      ),
    },
    {
      key: "judul",
      label: "Judul Task",
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.judul}</p>
          {item.deskripsi && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.deskripsi}</p>
          )}
        </div>
      ),
    },
    {
      key: "module",
      label: "Modul",
      width: "140px",
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.module?.nama ?? "-"}
        </span>
      ),
    },
    {
      key: "prioritas",
      label: "Prioritas",
      width: "100px",
      render: (item) => {
        const cfg = PRIORITAS_CHIP[item.prioritas] ?? { label: item.prioritas, color: "default" as const };
        return <Chip size="sm" color={cfg.color} className="text-[11px]">{cfg.label}</Chip>;
      },
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (item) => {
        const cfg = STATUS_CHIP[item.status] ?? { label: item.status, color: "default" as const };
        return <Chip size="sm" color={cfg.color} className="text-[11px]">{cfg.label}</Chip>;
      },
    },
    {
      key: "assignee_name",
      label: "Assignee",
      width: "120px",
      render: (item) => (
        item.assignee_name ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#0B5EA8] text-white text-[10px] flex items-center justify-center font-bold">
              {item.assignee_initial || item.assignee_name[0]}
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300">{item.assignee_name}</span>
          </div>
        ) : <span className="text-xs text-gray-400">-</span>
      ),
    },
    {
      key: "due_date",
      label: "Deadline",
      width: "110px",
      render: (item) => {
        const overdue = item.status !== 'done' && item.due_date && new Date(item.due_date) < new Date();
        return (
            <>
            <span className={`text-xs ${overdue ? "text-red-500 font-semibold" : "text-gray-500"}`}>
              {formatDateShort(item.due_date)}
            </span>
            </>
        );
      },
    },
  ];

  const moduleOptions = [
    { value: "all", label: "Semua Modul" },
    ...modules.map(m => ({ value: String(m.id), label: m.nama })),
  ];

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
  ];

  const priorityOptions = [
    { value: "all", label: "Semua Prioritas" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
      <>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiList className="w-5 h-5 text-[#0B5EA8]" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Task</h1>
            </div>
            <Btn size="sm" startContent={<FiPlus className="w-3.5 h-3.5" />} onClick={() => setIsCreateOpen(true)}>
              Buat Task
            </Btn>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <TwSelect
              value={moduleFilter}
              onValueChange={(v) => { setModuleFilter(v || "all"); setCurrentPage(1); }}
              options={moduleOptions}
              selectSize="sm"
              className="w-36 shrink-0"
            />
            <TwSelect
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v || "all"); setCurrentPage(1); }}
              options={statusOptions}
              selectSize="sm"
              className="w-36 shrink-0"
            />
            <TwSelect
              value={priorityFilter}
              onValueChange={(v) => { setPriorityFilter(v || "all"); setCurrentPage(1); }}
              options={priorityOptions}
              selectSize="sm"
              className="w-36 shrink-0"
            />
            {(moduleFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all") && (
              <button
                onClick={() => { setModuleFilter("all"); setStatusFilter("all"); setPriorityFilter("all"); setCurrentPage(1); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <DataTable
              data={tasks}
              columns={columns}
              loading={isLoading}
              serverSide
              totalRecords={totalRecords}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              searchable={false}
              emptyMessage={
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <FiList className="w-10 h-10 mb-2" />
                  <p className="text-sm">Belum ada task</p>
                </div>
              }
            />
          </div>
        </div>

        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          modules={modules}
          onTaskUpdated={handleTaskUpdated}
        />

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
