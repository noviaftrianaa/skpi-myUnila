"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Progress,
} from "@heroui/react";
import {
  FiFolder,
  FiLayout,
  FiList,
  FiClock,
  FiLayers,
  FiFileText,
  FiActivity,
  FiSettings,
  FiPlus,
  FiPrinter,
  FiExternalLink,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiGrid,
  FiCalendar,
  FiAlertCircle,
  FiFlag,
} from "react-icons/fi";
import Link from "next/link";
import ProgressReport from "../components/ProgressReport";
import TaskCreateModal from "../components/TaskCreateModal";
import {
  projectService,
  type Project,
  type Task,
  type ProjectModule,
  type Activity,
  type DocumentListItem,
  type Sprint,
} from "@/lib/services/project/projectService";

// ─── Nav tabs ────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { label: "Overview", icon: <FiGrid className="w-3.5 h-3.5" />, href: "" },
  { label: "Board", icon: <FiLayout className="w-3.5 h-3.5" />, href: "/board" },
  { label: "List", icon: <FiList className="w-3.5 h-3.5" />, href: "/list" },
  { label: "Timeline", icon: <FiClock className="w-3.5 h-3.5" />, href: "/timeline" },
  { label: "Modul", icon: <FiLayers className="w-3.5 h-3.5" />, href: "/modules" },
  { label: "Dokumen", icon: <FiFileText className="w-3.5 h-3.5" />, href: "/documents" },
  { label: "Aktivitas", icon: <FiActivity className="w-3.5 h-3.5" />, href: "/activity" },
  { label: "Analytics", icon: <FiActivity className="w-3.5 h-3.5" />, href: "/analytics" },
  { label: "Pengaturan", icon: <FiSettings className="w-3.5 h-3.5" />, href: "/settings" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(status: Project["status"]) {
  switch (status) {
    case "active": return "success";
    case "completed": return "primary";
    case "archived": return "default";
    default: return "default";
  }
}

function statusLabel(status: Project["status"]) {
  switch (status) {
    case "active": return "Aktif";
    case "completed": return "Selesai";
    case "archived": return "Diarsipkan";
    default: return status;
  }
}

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
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
        setModules(mods);
        setTasks(tasksResp.data);
        setActivities(actResp.data);
        setDocuments(docsResp.data ?? []);
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

  // ── Computed stats ──────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const overdueTasks = tasks.filter((t) => {
    const due = t.due_date ? new Date(t.due_date) : t.tgl_target ? new Date(t.tgl_target) : null;
    return due && due < today && t.status !== "done" && t.status !== "cancelled";
  });
  const progress =
    totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Document expiry
  const expiredDocs = documents.filter((d) => {
    if (!d.tgl_berakhir) return false;
    const exp = new Date(d.tgl_berakhir);
    exp.setHours(0, 0, 0, 0);
    return exp < today;
  });
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const expiringSoonDocs = documents.filter((d) => {
    if (!d.tgl_berakhir) return false;
    const exp = new Date(d.tgl_berakhir);
    exp.setHours(0, 0, 0, 0);
    return exp >= today && exp <= in30Days;
  });

  // Module progress
  const moduleStats = modules.map((m) => {
    const mTasks = tasks.filter((t) => t.module_id === m.id);
    const mDone = mTasks.filter((t) => t.status === "done").length;
    const mPct = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : 0;
    return { ...m, total: mTasks.length, done: mDone, pct: mPct };
  });

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" color="primary" />
          </div>
        </>
);
  }

  const base = `/dashboard/project-management/${projectId}`;

  return (
      <>
        <div className="space-y-5 print:space-y-4">
          {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 print:hidden">
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

          {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
          <div className="print:hidden overflow-x-auto">
            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 min-w-max pb-0">
              {NAV_TABS.map((tab) => {
                const href = `${base}${tab.href}`;
                const isActive = tab.href === "";
                return (
                  <Link
                    key={tab.label}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-[#0B5EA8] text-[#0B5EA8]"
                        : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Project Header Card ─────────────────────────────────────────────── */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm print:shadow-none">
            <CardBody className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Color badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: project?.warna ?? "#0B5EA8" }}
                >
                  {project?.kode?.slice(0, 2).toUpperCase() ?? "P"}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {project?.nama}
                    </h1>
                    <Chip size="sm" variant="flat" className="font-mono text-xs">
                      {project?.kode}
                    </Chip>
                    {project?.status && (
                      <Chip
                        size="sm"
                        color={statusColor(project.status)}
                        variant="flat"
                        className="text-xs"
                      >
                        {statusLabel(project.status)}
                      </Chip>
                    )}
                  </div>

                  {project?.deskripsi && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.deskripsi}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {project?.tanggal_mulai && (
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        Mulai: {formatDateId(project.tanggal_mulai)}
                      </span>
                    )}
                    {project?.tanggal_target && (
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        Target: {formatDateId(project.tanggal_target)}
                      </span>
                    )}
                    {project?.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#0B5EA8] hover:underline"
                      >
                        <FiExternalLink className="w-3.5 h-3.5" />
                        Repository
                      </a>
                    )}
                  </div>
                </div>

                {/* Overall progress */}
                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <span className="text-2xl font-bold text-[#0B5EA8]">{progress}%</span>
                  <Progress
                    value={progress}
                    className="w-32"
                    color="primary"
                    size="sm"
                    aria-label="progress"
                  />
                  <span className="text-xs text-gray-400">Progress keseluruhan</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ── Stats Row ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Tasks */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Total Task</p>
              </CardBody>
            </Card>

            {/* Selesai */}
            <Card className="border border-emerald-200 dark:border-emerald-800 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardBody className="p-4 text-center">
                <div className="flex justify-center mb-1">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{doneTasks.length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Selesai</p>
              </CardBody>
            </Card>

            {/* In Progress */}
            <Card className="border border-amber-200 dark:border-amber-800 shadow-sm bg-amber-50/50 dark:bg-amber-950/20">
              <CardBody className="p-4 text-center">
                <div className="flex justify-center mb-1">
                  <FiLoader className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{inProgressTasks.length}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">In Progress</p>
              </CardBody>
            </Card>

            {/* Overdue */}
            <Card className={`border shadow-sm ${overdueTasks.length > 0 ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" : "border-gray-200 dark:border-gray-700"}`}>
              <CardBody className="p-4 text-center">
                <div className="flex justify-center mb-1">
                  <FiAlertTriangle className={`w-4 h-4 ${overdueTasks.length > 0 ? "text-red-600" : "text-gray-400"}`} />
                </div>
                <p className={`text-2xl font-bold ${overdueTasks.length > 0 ? "text-red-700 dark:text-red-400" : "text-gray-400"}`}>
                  {overdueTasks.length}
                </p>
                <p className={`text-xs mt-1 ${overdueTasks.length > 0 ? "text-red-600 dark:text-red-500" : "text-gray-400"}`}>
                  Overdue
                </p>
              </CardBody>
            </Card>

            {/* Progress */}
            <Card className="border border-blue-200 dark:border-blue-800 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
              <CardBody className="p-4 text-center">
                <p className="text-2xl font-bold text-[#0B5EA8] dark:text-blue-400">{progress}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Progress</p>
              </CardBody>
            </Card>

            {/* Total Modules */}
            <Card className="border border-purple-200 dark:border-purple-800 shadow-sm bg-purple-50/50 dark:bg-purple-950/20">
              <CardBody className="p-4 text-center">
                <div className="flex justify-center mb-1">
                  <FiLayers className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{modules.length}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">Modul</p>
              </CardBody>
            </Card>
          </div>

          {/* ── Sprints Section ────────────────────────────────────────────────── */}
          {sprints.length > 0 && (() => {
            const activeSprint = sprints.find((s) => s.status === "active");
            const plannedCount = sprints.filter((s) => s.status === "planned").length;
            const completedCount = sprints.filter((s) => s.status === "completed").length;
            return (
              <Card className="border border-indigo-200 dark:border-indigo-800 shadow-sm bg-indigo-50/40 dark:bg-indigo-950/20 print:hidden">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                      <FiFlag className="w-4 h-4" />
                      Sprints
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400">
                      <span>{sprints.length} total</span>
                      {plannedCount > 0 && <span className="text-amber-600">{plannedCount} planned</span>}
                      {completedCount > 0 && <span className="text-emerald-600">{completedCount} selesai</span>}
                    </div>
                  </div>
                  {activeSprint ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color="success" variant="flat" className="text-xs">Active</Chip>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">{activeSprint.nm_sprint}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activeSprint.task_done ?? 0}/{activeSprint.total_tasks ?? 0} task
                        </span>
                      </div>
                      <Progress
                        value={
                          (activeSprint.total_tasks ?? 0) > 0
                            ? Math.round(((activeSprint.task_done ?? 0) / (activeSprint.total_tasks ?? 1)) * 100)
                            : 0
                        }
                        size="sm"
                        color="success"
                        aria-label="sprint progress"
                      />
                      {(activeSprint.tgl_mulai || activeSprint.tgl_selesai) && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {activeSprint.tgl_mulai && <span>Mulai: {formatDateId(activeSprint.tgl_mulai)}</span>}
                          {activeSprint.tgl_selesai && <span>Target: {formatDateId(activeSprint.tgl_selesai)}</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Tidak ada sprint aktif saat ini.</p>
                  )}
                  {/* Planned sprints preview */}
                  {plannedCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900 flex flex-wrap gap-2">
                      {sprints
                        .filter((s) => s.status === "planned")
                        .slice(0, 3)
                        .map((s) => (
                          <Chip key={s.id_sprint} size="sm" variant="bordered" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
                            {s.nm_sprint}
                          </Chip>
                        ))}
                      {plannedCount > 3 && (
                        <span className="text-xs text-gray-400 self-center">+{plannedCount - 3} lagi</span>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })()}

          {/* ── Quick Actions ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Link href={`${base}/board`}>
              <Button
                size="sm"
                color="primary"
                className="bg-[#0B5EA8] text-white"
                startContent={<FiLayout className="w-3.5 h-3.5" />}
              >
                Kanban Board
              </Button>
            </Link>
            <Button
              size="sm"
              variant="bordered"
              startContent={<FiPrinter className="w-3.5 h-3.5" />}
              onPress={() => window.print()}
            >
              Cetak Laporan
            </Button>
            <Link href={`${base}/documents`}>
              <Button
                size="sm"
                variant="bordered"
                startContent={<FiFileText className="w-3.5 h-3.5" />}
              >
                Dokumen
              </Button>
            </Link>
            <Button
              size="sm"
              variant="bordered"
              startContent={<FiPlus className="w-3.5 h-3.5" />}
              onPress={() => setIsCreateOpen(true)}
            >
              Tambah Task
            </Button>
          </div>

          {/* ── Content Grid ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Module Progress + Overdue ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Progress per Module */}
              {moduleStats.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardBody className="p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <FiLayers className="w-4 h-4 text-[#0B5EA8]" />
                      Progress per Modul
                    </h2>
                    <div className="space-y-3">
                      {moduleStats.map((m) => (
                        <Link
                          key={m.id}
                          href={`${base}/board?module_id=${m.id}`}
                          className="block group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#0B5EA8] transition-colors truncate">
                                {m.nama}
                              </span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {m.done}/{m.total} · {m.pct}%
                              </span>
                            </div>
                            <Progress
                              value={m.pct}
                              size="sm"
                              color={m.pct === 100 ? "success" : "primary"}
                              aria-label={m.nama}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Overdue Tasks Warning */}
              {overdueTasks.length > 0 && (
                <Card className="border border-red-200 dark:border-red-800 shadow-sm bg-red-50/50 dark:bg-red-950/20">
                  <CardBody className="p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <FiAlertTriangle className="w-4 h-4" />
                      Task Overdue ({overdueTasks.length})
                    </h2>
                    <div className="space-y-2">
                      {overdueTasks.slice(0, 8).map((t) => {
                        const due = t.due_date ?? t.tgl_target;
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-2 py-1.5 border-b border-red-100 dark:border-red-900 last:border-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Chip size="sm" variant="flat" color="danger" className="font-mono text-xs flex-shrink-0">
                                {t.kode}
                              </Chip>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {t.judul}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {t.assignee_name && (
                                <span className="text-xs text-gray-400 hidden sm:block">{t.assignee_name}</span>
                              )}
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                {formatDateId(due)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {overdueTasks.length > 8 && (
                        <p className="text-xs text-red-500 text-center pt-1">
                          +{overdueTasks.length - 8} task overdue lainnya
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Document Expiry Warning */}
              {(expiredDocs.length > 0 || expiringSoonDocs.length > 0) && (
                <Card className="border border-amber-200 dark:border-amber-800 shadow-sm bg-amber-50/50 dark:bg-amber-950/20">
                  <CardBody className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <FiAlertCircle className="w-4 h-4" />
                        Dokumen Perlu Perhatian
                      </h2>
                      <Link
                        href={`${base}/documents`}
                        className="text-xs text-[#0B5EA8] hover:underline"
                      >
                        Lihat semua
                      </Link>
                    </div>

                    {expiredDocs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                          🔴 Expired ({expiredDocs.length})
                        </p>
                        <div className="space-y-1.5">
                          {expiredDocs.slice(0, 4).map((d) => (
                            <Link
                              key={d.id_document}
                              href={`${base}/documents`}
                              className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-red-100/60 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FiFileText className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{d.nm_dokumen}</span>
                                {d.nomor_dokumen && (
                                  <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{d.nomor_dokumen}</span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex-shrink-0 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {formatDateId(d.tgl_berakhir)}
                              </span>
                            </Link>
                          ))}
                          {expiredDocs.length > 4 && (
                            <p className="text-xs text-red-500 text-center pt-1">
                              +{expiredDocs.length - 4} dokumen expired lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {expiringSoonDocs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                          🟡 Akan Berakhir &lt;30 hari ({expiringSoonDocs.length})
                        </p>
                        <div className="space-y-1.5">
                          {expiringSoonDocs.slice(0, 4).map((d) => (
                            <Link
                              key={d.id_document}
                              href={`${base}/documents`}
                              className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FiFileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{d.nm_dokumen}</span>
                                {d.nomor_dokumen && (
                                  <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{d.nomor_dokumen}</span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {formatDateId(d.tgl_berakhir)}
                              </span>
                            </Link>
                          ))}
                          {expiringSoonDocs.length > 4 && (
                            <p className="text-xs text-amber-500 text-center pt-1">
                              +{expiringSoonDocs.length - 4} dokumen lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Right: Recent Activity ──────────────────────────────────────────── */}
            <div>
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                <CardBody className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <FiActivity className="w-4 h-4 text-[#0B5EA8]" />
                      Aktivitas Terbaru
                    </h2>
                    <Link
                      href={`${base}/activity`}
                      className="text-xs text-[#0B5EA8] hover:underline"
                    >
                      Lihat semua
                    </Link>
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <FiActivity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Belum ada aktivitas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((a) => (
                        <div key={a.id} className="flex items-start gap-2.5">
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full bg-[#0B5EA8]/10 dark:bg-[#0B5EA8]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#0B5EA8]">
                            {a.user_name?.slice(0, 2).toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">{a.user_name}</span>{" "}
                              {a.aksi}
                              {a.task_kode && (
                                <span className="font-mono text-[#0B5EA8] ml-1">{a.task_kode}</span>
                              )}
                            </p>
                            {a.detail && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{a.detail}</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>

          {/* ── Progress Report (screen: shown below; print: full page) ─────────── */}
          {project && (
            <div className="mt-4">
              <ProgressReport
                project={project}
                modules={modules}
                tasks={tasks}
              />
            </div>
          )}
        </div>

        {/* ── Task Create Modal ─────────────────────────────────────────────────── */}
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
