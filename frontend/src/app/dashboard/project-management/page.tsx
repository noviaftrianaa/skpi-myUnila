"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardBody, Btn, Spinner, TwInput, Chip } from "./components/ui";
import {
  FiFolder,
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiPlus,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { motion } from "framer-motion";
import ProjectCard from "./components/ProjectCard";
import ProjectCreateModal from "./components/ProjectCreateModal";
import { projectService, type Project, type ProjectStats } from "@/lib/services/project/projectService";
// Pimpinan role names that can see public projects
const PIMPINAN_ROLES = [
  "rektor",
  "wakil rektor",
  "wr1", "wr2", "wr3", "wr4",
  "dekan",
  "kaprodi",
  "kepala program studi",
  "lp3m",
];

function isPimpinanRole(role: string | null): boolean {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return PIMPINAN_ROLES.some(r => roleLower.includes(r));
}

export default function ProjectManagementDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [watchedProjects, setWatchedProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isPimpinan = isPimpinanRole(user?.role ?? null);
  const userId = user?.id ?? "";

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, projectsData] = await Promise.all([
          projectService.getStats().catch(() => null),
          (async () => {
            const fallback = { data: [], meta: { total: 0, page: 1, per_page: 50, total_pages: 0 } };
            try {
              // Try user-specific projects first
              if (userId) {
                const myRes = await projectService.getMyProjects({ user_id: userId, is_pimpinan: isPimpinan, limit: 50 });
                if (myRes.data && myRes.data.length > 0) return myRes;
              }
              // Fallback: get all projects (public visibility)
              return await projectService.getProjects({ per_page: 50 });
            } catch {
              try { return await projectService.getProjects({ per_page: 50 }); } catch { return fallback; }
            }
          })(),
        ]);
        if (isMounted) {
          setStats(statsData);
          const allProjects = projectsData.data ?? [];

          if (isPimpinan) {
            // Separate watched (watcher) vs member projects
            // For now show all — backend already filters correctly
            setProjects(allProjects);
            // Watched projects = projects with visibility=public that user is not a member of
            // We can't distinguish easily here without extra API call, so just show all public ones separately
            const publicProjects = allProjects.filter(
              (p: Project) => (p.visibility ?? (p as Record<string, unknown>)['visibility']) === 'public'
            );
            setWatchedProjects(publicProjects);
          } else {
            setProjects(allProjects);
          }
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [userId, isPimpinan]);

  const statsCards = [
    {
      title: "Total Project",
      value: stats?.total_project ?? 0,
      icon: <FiFolder className="w-7 h-7 text-white" />,
      color: "from-indigo-500 to-indigo-600",
      subtitle: "project terdaftar",
    },
    {
      title: "Project Aktif",
      value: stats?.project_aktif ?? 0,
      icon: <FiActivity className="w-7 h-7 text-white" />,
      color: "from-emerald-500 to-emerald-600",
      subtitle: "sedang berjalan",
    },
    {
      title: "Task Selesai",
      value: stats?.task_done ?? 0,
      icon: <FiCheckCircle className="w-7 h-7 text-white" />,
      color: "from-blue-500 to-blue-600",
      subtitle: "task telah selesai",
    },
    {
      title: "Task Overdue",
      value: stats?.task_overdue ?? 0,
      icon: <FiAlertTriangle className="w-7 h-7 text-white" />,
      color: "from-orange-500 to-orange-600",
      subtitle: "melewati deadline",
    },
  ];

  const filteredProjects = projects.filter(p => {
    const nama = (p.nama ?? (p as unknown as Record<string, string>).nm_project ?? "").toLowerCase();
    const kode = (p.kode ?? (p as unknown as Record<string, string>).kode_project ?? "").toLowerCase();
    return !search || nama.includes(search.toLowerCase()) || kode.includes(search.toLowerCase());
  });

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        </>
);
  }

  return (
      <>
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B5EA8] via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiFolder className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Project Management System</span>
                  {isPimpinan && (
                    <Chip
                      size="sm"
                      className="bg-yellow-400 text-yellow-900 font-semibold text-[10px]"
                    >
                      👑 Pimpinan View
                    </Chip>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  🎯 Selamat Datang, {user?.name?.split(" ")[0] ?? "Developer"}!
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {isPimpinan
                    ? "Pantau progress semua project development di unit Anda."
                    : "Kelola dan pantau progress semua project development secara terpusat."}
                </p>
              </div>
              <Btn
                size="md"
                className="bg-white text-[#0B5EA8] font-semibold shrink-0 hover:bg-blue-50 transition-colors"
                startContent={<FiPlus className="w-4 h-4" />}
                onClick={() => setIsCreateOpen(true)}
              >
                + Project
              </Btn>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`bg-gradient-to-br ${stat.color} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  <CardBody className="p-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                        {stat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/90 mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                          {stat.value}
                        </h3>
                        <p className="text-[10px] text-white/80 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pimpinan: Watched projects section */}
          {isPimpinan && watchedProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiEye className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project yang Anda Pantau
                </h2>
                <span className="text-sm font-normal text-gray-400">({watchedProjects.length})</span>
                <Chip size="sm" className="bg-yellow-100 text-yellow-800 text-[10px]">
                  🌐 Public
                </Chip>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {watchedProjects.slice(0, 6).map((project, i) => (
                  <motion.div
                    key={project.id ?? project.id_project}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProjectCard project={project} showVisibility />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Projects section */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiFolder className="w-5 h-5 text-[#0B5EA8]" />
                {isPimpinan ? "Semua Project Tersedia" : "Semua Project"}
                <span className="text-sm font-normal text-gray-400">({filteredProjects.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <TwInput
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Cari project..."
                  startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                  variant="secondary"
                  size="sm"
                  className="w-64"
                />
                <Btn
                 
                  className="bg-[#0B5EA8] text-white"
                  size="sm"
                  startContent={<FiPlus className="w-4 h-4" />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Buat Project
                </Btn>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                <CardBody className="flex flex-col items-center justify-center py-16">
                  <FiFolder className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {search ? "Tidak ada project yang cocok" : "Belum ada project"}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {search ? "Coba kata kunci lain" : "Mulai dengan membuat project pertama Anda!"}
                  </p>
                  {!search && (
                    <Btn
                     
                      className="bg-[#0B5EA8]"
                      size="sm"
                      startContent={<FiPlus className="w-4 h-4" />}
                      onClick={() => setIsCreateOpen(true)}
                    >
                      Buat Project Pertama
                    </Btn>
                  )}
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id ?? project.id_project}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProjectCard project={project} showVisibility />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ProjectCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleProjectCreated}
        />
      </>
);
}
