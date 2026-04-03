"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, Btn, Chip, Spinner, Progress } from "../components/ui";
import {
  FiFolder,
  FiLayers,
  FiActivity,
  FiExternalLink,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiCalendar,
  FiFlag,
  FiEdit2,
} from "react-icons/fi";
import Link from "next/link";
import ProgressReport from "../components/ProgressReport";
import ProjectEditModal from "../components/ProjectEditModal";
import {
  projectService,
  type Project,
  type Task,
  type ProjectModule,
  type Activity,
  type DocumentListItem,
  type Sprint,
} from "@/lib/services/project/projectService";

// Tab navigation is in layout.tsx

function formatDateId(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [proj, mods, tasksResp, actResp, docsResp, sprintsResp] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getModules(projectId),
          projectService.getTasks(projectId, { per_page: 100 }),
          projectService.getActivity(projectId, { per_page: 10 }),
          projectService.getDocuments(projectId, { limit: 200 }),
          projectService.getSprints(projectId).catch(() => []),
        ]);
        if (cancelled) return;
        setProject(proj);
        setModules(mods ?? []);
        setTasks(tasksResp?.data ?? []);
        setActivities(actResp?.data ?? []);
        setDocuments(docsResp?.data ?? []);
        setSprints(sprintsResp ?? []);
      } catch (error: unknown) {
        if (cancelled) return;
        const axiosErr = error as { code?: string };
        if (axiosErr?.code === "ECONNABORTED" || axiosErr?.code === "ERR_CANCELED") return;
        console.error("Error loading project overview:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [projectId]);

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const overdueTasks = tasks.filter((t) => {
    const due = t.due_date ? new Date(t.due_date) : t.tgl_target ? new Date(t.tgl_target) : null;
    return due && due < today && t.status !== "done" && t.status !== "cancelled";
  });
  const progress = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  const moduleStats = modules.map((m) => {
    const mTasks = tasks.filter((t) => t.module_id === m.id);
    const mDone = mTasks.filter((t) => t.status === "done").length;
    const mPct = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : 0;
    return { ...m, total: mTasks.length, done: mDone, pct: mPct };
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400">Memuat project...</p>
        </div>
      </div>
    );
  }

  const base = `/dashboard/project-management/${projectId}`;

  return (
    <div className="space-y-5">
      {/* Project Header */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: project?.warna ?? "#6366f1" }} />
        <CardBody className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg"
              style={{ backgroundColor: project?.warna ?? "#6366f1" }}
            >
              {project?.kode?.slice(0, 2).toUpperCase() ?? "P"}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {project?.nama}
                </h1>
                <Chip size="sm" className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500">
                  {project?.kode}
                </Chip>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  title="Edit Project"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                {project?.status && (
                  <Chip
                    size="sm"
                    color={project.status === "active" ? "success" : project.status === "completed" ? "primary" : "default"}
                  >
                    {project.status === "active" ? "Aktif" : project.status === "completed" ? "Selesai" : "Arsip"}
                  </Chip>
                )}
              </div>

              {project?.deskripsi && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.deskripsi}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                {(project?.tanggal_mulai || project?.tgl_mulai) && (
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    Mulai: {formatDateId(project.tanggal_mulai ?? project.tgl_mulai)}
                  </span>
                )}
                {(project?.tanggal_target || project?.tgl_target) && (
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    Target: {formatDateId(project.tanggal_target ?? project.tgl_target)}
                  </span>
                )}
                {project?.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors">
                    <FiExternalLink className="w-3 h-3" />
                    Repository
                  </a>
                )}
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex flex-col items-center gap-1 sm:items-end flex-shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                    strokeLinecap="round"
                    className={progress === 100 ? "text-emerald-500" : "text-indigo-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{progress}%</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">Progress</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "Total", value: totalTasks, color: "text-gray-600" },
          { label: "Selesai", value: doneTasks.length, color: "text-emerald-600", icon: <FiCheckCircle className="w-3 h-3" /> },
          { label: "In Progress", value: inProgressTasks.length, color: "text-amber-600", icon: <FiLoader className="w-3 h-3" /> },
          { label: "Overdue", value: overdueTasks.length, color: overdueTasks.length > 0 ? "text-red-600" : "text-gray-400", icon: <FiAlertTriangle className="w-3 h-3" /> },
          { label: "Progress", value: `${progress}%`, color: "text-indigo-600" },
          { label: "Modul", value: modules.length, color: "text-purple-600", icon: <FiLayers className="w-3 h-3" /> },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardBody className="p-3 text-center">
              {s.icon && <div className={`flex justify-center mb-0.5 ${s.color}`}>{s.icon}</div>}
              <p className={`text-lg font-bold ${s.color} dark:text-opacity-80`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Sprint */}
      {sprints.length > 0 && (() => {
        const activeSprint = sprints.find((s) => s.status === "active");
        return activeSprint ? (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiFlag className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{activeSprint.nm_sprint}</span>
                  <Chip size="sm" color="success">Active</Chip>
                </div>
                <span className="text-xs text-gray-500">
                  {activeSprint.task_done ?? 0}/{activeSprint.total_tasks ?? 0} task
                </span>
              </div>
              <Progress
                value={(activeSprint.total_tasks ?? 0) > 0 ? Math.round(((activeSprint.task_done ?? 0) / (activeSprint.total_tasks ?? 1)) * 100) : 0}
                color="success"
              />
              {(activeSprint.tgl_mulai || activeSprint.tgl_selesai) && (
                <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2">
                  {activeSprint.tgl_mulai && <span>Mulai: {formatDateId(activeSprint.tgl_mulai)}</span>}
                  {activeSprint.tgl_selesai && <span>Target: {formatDateId(activeSprint.tgl_selesai)}</span>}
                </div>
              )}
            </CardBody>
          </Card>
        ) : null;
      })()}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Module Progress */}
          {moduleStats.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardBody className="p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-indigo-500" />
                  Progress per Modul
                </h2>
                <div className="space-y-3">
                  {moduleStats.map((m) => (
                    <Link key={m.id} href={`${base}/board?module_id=${m.id}`} className="block group">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors truncate">
                            {m.nama}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {m.done}/{m.total} · {m.pct}%
                          </span>
                        </div>
                        <Progress value={m.pct} color={m.pct === 100 ? "success" : "primary"} />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="border border-red-100 dark:border-red-900/40 shadow-sm bg-red-50/30 dark:bg-red-950/10">
              <CardBody className="p-5 space-y-3">
                <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4" />
                  Overdue ({overdueTasks.length})
                </h2>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 6).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-red-100/60 dark:border-red-900/20 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Chip size="sm" className="font-mono text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
                          {t.kode}
                        </Chip>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{t.judul}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 flex-shrink-0">
                        {formatDateId(t.due_date ?? t.tgl_target)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right 1/3: Activity */}
        <div>
          <Card className="border-0 shadow-sm h-fit">
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-indigo-500" />
                  Aktivitas Terbaru
                </h2>
                <Link href={`${base}/activity`} className="text-xs text-indigo-500 hover:text-indigo-600">
                  Semua
                </Link>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <FiActivity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Belum ada aktivitas</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {activities.map((a) => (
                    <div key={a.id ?? (a as Record<string, unknown>).id_activity as string} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {(a.user_name ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {a.user_name && <span className="font-semibold">{a.user_name} </span>}
                          {a.aksi}
                          {a.task_kode && <span className="font-mono text-indigo-500 ml-1">{a.task_kode}</span>}
                        </p>
                        {a.detail && <p className="text-[10px] text-gray-400 truncate mt-0.5">{a.detail}</p>}
                        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Progress Report */}
      {project && (
        <div className="mt-4 print:mt-0">
          <ProgressReport project={project} modules={modules} tasks={tasks} />
        </div>
      )}

      <ProjectEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onUpdated={(updated) => setProject(updated)}
      />
    </div>
  );
}
