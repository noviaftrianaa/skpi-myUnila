"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  FiFolder,
  FiLayers,
  FiActivity,
  FiCheckCircle,
  FiLoader,
  FiAlertTriangle,
  FiExternalLink,
  FiCalendar,
  FiFlag,
  FiLock,
  FiShare2,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_PROJECT_API_URL || "http://localhost:8095/api/v1";

function formatDateId(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

interface PublicProject {
  id_project: string;
  kode_project: string;
  nm_project: string;
  deskripsi?: string;
  status: string;
  warna?: string;
  tgl_mulai?: string;
  tgl_target?: string;
  repo_url?: string;
  visibility: string;
}

interface PublicModule {
  id_module: string;
  nm_module: string;
  deskripsi?: string;
  status?: string;
  total_tasks?: number;
  task_done?: number;
}

interface PublicTask {
  id_task: string;
  kode_task: string;
  judul: string;
  status: string;
  prioritas: string;
  tgl_target?: string;
}

interface PublicActivity {
  id_activity: string;
  aksi: string;
  detail?: string;
  created_at: string;
}

interface PublicSprint {
  id_sprint: string;
  nm_sprint: string;
  status: string;
  tgl_mulai?: string;
  tgl_selesai?: string;
  total_tasks?: number;
  task_done?: number;
}

const statusColors: Record<string, string> = {
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  todo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  backlog: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  done: "Selesai", in_progress: "In Progress", todo: "To Do",
  backlog: "Backlog", review: "Review", cancelled: "Dibatalkan",
};

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<PublicProject | null>(null);
  const [modules, setModules] = useState<PublicModule[]>([]);
  const [tasks, setTasks] = useState<PublicTask[]>([]);
  const [activities, setActivities] = useState<PublicActivity[]>([]);
  const [sprints, setSprints] = useState<PublicSprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const base = `${API}/public/project/${projectId}`;
        const [projRes, modsRes, tasksRes, actRes, sprintRes] = await Promise.all([
          axios.get(base),
          axios.get(`${base}/modules`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/tasks?per_page=100`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/activity?per_page=15`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/sprints`).catch(() => ({ data: { data: [] } })),
        ]);
        if (!projRes.data.success) throw new Error(projRes.data.message);
        setProject(projRes.data.data);
        setModules(modsRes.data.data ?? []);
        setTasks(tasksRes.data.data ?? []);
        setActivities(actRes.data.data ?? []);
        setSprints(sprintRes.data.data ?? []);
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || "Project tidak ditemukan atau tidak bersifat publik.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Memuat project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto">
            <FiLock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Akses Ditolak</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const accent = project.warna || "#6366f1";
  const activeSprint = sprints.find(s => s.status === "active");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: accent }}>
              {project.kode_project?.slice(0, 2) ?? "P"}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{project.nm_project}</h1>
              <p className="text-[10px] text-gray-400 font-mono">{project.kode_project}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              🌐 Public
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              {copied ? "Tersalin!" : "Share"}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white" style={{ backgroundColor: accent }}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs">
              <FiFolder className="w-4 h-4" />
              <span>{project.status === "active" ? "Aktif" : project.status}</span>
              {project.repo_url && (
                <>
                  <span>·</span>
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                    <FiExternalLink className="w-3 h-3" /> Repository
                  </a>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{project.nm_project}</h2>
            {project.deskripsi && (
              <p className="text-white/80 text-sm max-w-2xl line-clamp-3">{project.deskripsi}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-white/70">
              {project.tgl_mulai && <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Mulai: {formatDateId(project.tgl_mulai)}</span>}
              {project.tgl_target && <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Target: {formatDateId(project.tgl_target)}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Task", value: totalTasks, icon: <FiFolder className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400" },
            { label: "Selesai", value: doneTasks, icon: <FiCheckCircle className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" },
            { label: "In Progress", value: inProgress, icon: <FiLoader className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" },
            { label: "Progress", value: `${progress}%`, icon: <FiActivity className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sprint */}
        {activeSprint && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiFlag className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-white">{activeSprint.nm_sprint}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <span className="text-xs text-gray-400">{activeSprint.task_done ?? 0}/{activeSprint.total_tasks ?? 0}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(activeSprint.total_tasks ?? 0) > 0 ? Math.round(((activeSprint.task_done ?? 0) / (activeSprint.total_tasks ?? 1)) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Grid: Modules + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Modules */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <FiLayers className="w-4 h-4 text-indigo-500" />
                Progress per Modul
              </h3>
              {modules.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada modul</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((m) => {
                    const total = m.total_tasks ?? 0;
                    const done = m.task_done ?? 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={m.id_module} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{m.nm_module}</span>
                          <span className="text-xs text-gray-400 ml-2 shrink-0">{done}/{total} · {pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm h-fit">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <FiActivity className="w-4 h-4 text-indigo-500" />
                Aktivitas Terbaru
              </h3>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada aktivitas</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {activities.map((a) => (
                    <div key={a.id_activity} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-300">{a.aksi}</p>
                        {a.detail && <p className="text-[10px] text-gray-400 truncate">{a.detail}</p>}
                        <p className="text-[10px] text-gray-300 dark:text-gray-600">{timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Overview */}
        {tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <FiCheckCircle className="w-4 h-4 text-indigo-500" />
              Daftar Task ({totalTasks})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {tasks.slice(0, 50).map((t) => (
                <div key={t.id_task} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded shrink-0">
                      {t.kode_task}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{t.judul}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[t.status] ?? statusColors.backlog}`}>
                      {statusLabels[t.status] ?? t.status}
                    </span>
                    {t.tgl_target && (
                      <span className="text-[10px] text-gray-400">{formatDateId(t.tgl_target)}</span>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length > 50 && (
                <p className="text-xs text-gray-400 text-center pt-2">+{tasks.length - 50} task lainnya</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-400">
          <p>Project Management — Universitas Lampung</p>
          <p className="mt-1">
            <Link href="/login" className="text-indigo-500 hover:text-indigo-600">Login</Link>
            {" "}untuk akses penuh
          </p>
        </footer>
      </main>
    </div>
  );
}
