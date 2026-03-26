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
  FiGrid,
  FiLayout,
  FiList,
} from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_PROJECT_API_URL
  ? `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/v1`
  : "http://localhost:8095/api/v1";

function formatDateId(dateStr?: string) {
  if (!dateStr) return "-";
  try { return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return dateStr; }
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

interface PProject {
  id_project: string; kode_project: string; nm_project: string; deskripsi?: string;
  status: string; warna?: string; tgl_mulai?: string; tgl_target?: string;
  repo_url?: string; visibility: string;
}
interface PModule { id_module: string; nm_module: string; deskripsi?: string; total_tasks?: number; task_done?: number; }
interface PTask { id_task: string; kode_task: string; judul: string; status: string; prioritas: string; tgl_target?: string; id_module?: string; }
interface PActivity { id_activity: string; aksi: string; detail?: string; created_at: string; }
interface PSprint { id_sprint: string; nm_sprint: string; status: string; total_tasks?: number; task_done?: number; tgl_mulai?: string; tgl_selesai?: string; }

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
const priorityColors: Record<string, string> = {
  urgent: "border-l-red-500", high: "border-l-orange-400",
  medium: "border-l-blue-400", low: "border-l-gray-300",
};

type Tab = "overview" | "board" | "list" | "activity";

const BOARD_COLUMNS = ["backlog", "todo", "in_progress", "review", "done"];
const BOARD_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  backlog: { label: "Backlog", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  todo: { label: "To Do", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  in_progress: { label: "In Progress", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  review: { label: "Review", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  done: { label: "Done", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
};

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<PProject | null>(null);
  const [modules, setModules] = useState<PModule[]>([]);
  const [tasks, setTasks] = useState<PTask[]>([]);
  const [activities, setActivities] = useState<PActivity[]>([]);
  const [sprints, setSprints] = useState<PSprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const base = `${API}/public/project/${projectId}`;
        const [projRes, modsRes, tasksRes, actRes, sprintRes] = await Promise.all([
          axios.get(base),
          axios.get(`${base}/modules`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/tasks?per_page=200`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/activity?per_page=30`).catch(() => ({ data: { data: [] } })),
          axios.get(`${base}/sprints`).catch(() => ({ data: { data: [] } })),
        ]);
        if (!projRes.data.success) throw new Error(projRes.data.message);
        setProject(projRes.data.data);
        setModules(modsRes.data.data ?? []);
        setTasks(tasksRes.data.data ?? []);
        setActivities(actRes.data.data ?? []);
        setSprints(sprintRes.data.data ?? []);
      } catch (e: unknown) {
        setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Project tidak ditemukan atau tidak bersifat publik.");
      } finally { setIsLoading(false); }
    };
    load();
  }, [projectId]);

  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

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
          <p className="text-sm text-gray-500">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
            <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-medium">🌐 Public</span>
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <FiShare2 className="w-3.5 h-3.5" /> {copied ? "Tersalin!" : "Share"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Task", value: totalTasks, icon: <FiFolder className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" },
            { label: "Selesai", value: doneTasks, icon: <FiCheckCircle className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
            { label: "In Progress", value: inProgress, icon: <FiLoader className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
            { label: "Progress", value: `${progress}%`, icon: <FiActivity className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
                <div><p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{s.value}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto">
          <div className="flex items-center gap-0.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 min-w-max">
            {([
              { key: "overview", label: "Overview", icon: <FiGrid className="w-3.5 h-3.5" /> },
              { key: "board", label: "Board", icon: <FiLayout className="w-3.5 h-3.5" /> },
              { key: "list", label: "List", icon: <FiList className="w-3.5 h-3.5" /> },
              { key: "activity", label: "Aktivitas", icon: <FiActivity className="w-3.5 h-3.5" /> },
            ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.key ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white" style={{ backgroundColor: accent }}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-white/80 text-xs">
                  <FiFolder className="w-4 h-4" />
                  <span>{project.status === "active" ? "Aktif" : project.status}</span>
                  {project.repo_url && (<><span>·</span><a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white"><FiExternalLink className="w-3 h-3" /> Repo</a></>)}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{project.nm_project}</h2>
                {project.deskripsi && <p className="text-white/80 text-sm max-w-2xl line-clamp-3">{project.deskripsi}</p>}
                <div className="flex items-center gap-4 mt-4 text-xs text-white/70">
                  {project.tgl_mulai && <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Mulai: {formatDateId(project.tgl_mulai)}</span>}
                  {project.tgl_target && <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Target: {formatDateId(project.tgl_target)}</span>}
                </div>
              </div>
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
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(activeSprint.total_tasks ?? 0) > 0 ? Math.round(((activeSprint.task_done ?? 0) / (activeSprint.total_tasks ?? 1)) * 100) : 0}%` }} /></div>
              </div>
            )}

            {/* Modules + Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><FiLayers className="w-4 h-4 text-indigo-500" /> Progress per Modul</h3>
                {modules.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">Belum ada modul</p> : (
                  <div className="space-y-3">
                    {modules.map((m) => {
                      const total = m.total_tasks ?? 0, done = m.task_done ?? 0, pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (<div key={m.id_module} className="space-y-1.5">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{m.nm_module}</span><span className="text-xs text-gray-400 ml-2">{done}/{total} · {pct}%</span></div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5"><div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} /></div>
                      </div>);
                    })}
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm h-fit">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><FiActivity className="w-4 h-4 text-indigo-500" /> Aktivitas Terbaru</h3>
                {activities.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">Belum ada aktivitas</p> : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {activities.slice(0, 10).map((a) => (
                      <div key={a.id_activity} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <div className="min-w-0"><p className="text-xs text-gray-600 dark:text-gray-300">{a.aksi}</p>{a.detail && <p className="text-[10px] text-gray-400 truncate">{a.detail}</p>}<p className="text-[10px] text-gray-300 dark:text-gray-600">{timeAgo(a.created_at)}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === BOARD TAB === */}
        {activeTab === "board" && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {BOARD_COLUMNS.map((col) => {
                const colTasks = tasks.filter(t => t.status === col);
                const info = BOARD_LABELS[col];
                return (
                  <div key={col} className="w-72 shrink-0">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${info.bg}`}>
                      <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>
                      <span className="text-[10px] text-gray-400 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-b-xl p-2 space-y-2 min-h-[200px] border border-gray-100 dark:border-gray-800 border-t-0">
                      {colTasks.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-8">Kosong</p>
                      ) : colTasks.map((t) => (
                        <div key={t.id_task} className={`bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border-l-2 ${priorityColors[t.prioritas] ?? "border-l-gray-200"} hover:shadow-md transition-shadow`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono text-indigo-500">{t.kode_task}</span>
                            {t.tgl_target && <span className="text-[10px] text-gray-400">{formatDateId(t.tgl_target)}</span>}
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2">{t.judul}</p>
                          {t.prioritas && (
                            <span className={`inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              t.prioritas === "urgent" ? "bg-red-100 text-red-600" :
                              t.prioritas === "high" ? "bg-orange-100 text-orange-600" :
                              t.prioritas === "medium" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                            }`}>{t.prioritas}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === LIST TAB === */}
        {activeTab === "list" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-24">Kode</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Judul</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-28">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-24">Prioritas</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-28">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Belum ada task</td></tr>
                  ) : tasks.map((t) => (
                    <tr key={t.id_task} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-xs font-mono text-indigo-500">{t.kode_task}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200">{t.judul}</td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[t.status] ?? statusColors.backlog}`}>{statusLabels[t.status] ?? t.status}</span></td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        t.prioritas === "urgent" ? "bg-red-100 text-red-600" : t.prioritas === "high" ? "bg-orange-100 text-orange-600" : t.prioritas === "medium" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                      }`}>{t.prioritas}</span></td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{t.tgl_target ? formatDateId(t.tgl_target) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === ACTIVITY TAB === */}
        {activeTab === "activity" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><FiActivity className="w-4 h-4 text-indigo-500" /> Riwayat Aktivitas</h3>
            {activities.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas</p> : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id_activity} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{a.aksi}</p>
                      {a.detail && <p className="text-xs text-gray-400 mt-0.5">{a.detail}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(a.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-400">
          <p>Project Management — Universitas Lampung</p>
          <p className="mt-1"><Link href="/login" className="text-indigo-500 hover:text-indigo-600">Login</Link> untuk akses penuh</p>
        </footer>
      </main>
    </div>
  );
}
