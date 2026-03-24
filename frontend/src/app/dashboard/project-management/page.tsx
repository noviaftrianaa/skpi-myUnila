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
  FiGrid,
  FiList,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./components/ProjectCard";
import ProjectCreateModal from "./components/ProjectCreateModal";
import {
  projectService,
  type Project,
  type ProjectStats,
} from "@/lib/services/project/projectService";

export default function ProjectManagementDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userId = user?.id ?? "";

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, projectsData] = await Promise.all([
          projectService.getStats().catch(() => null),
          (async () => {
            const fallback = {
              data: [],
              meta: { total: 0, page: 1, per_page: 50, total_pages: 0 },
            };
            try {
              if (userId) {
                const myRes = await projectService.getMyProjects({
                  user_id: userId,
                  is_pimpinan: false,
                  limit: 50,
                });
                if (myRes.data && myRes.data.length > 0) return myRes;
              }
              return await projectService.getProjects({ per_page: 50 });
            } catch {
              try {
                return await projectService.getProjects({ per_page: 50 });
              } catch {
                return fallback;
              }
            }
          })(),
        ]);
        if (isMounted) {
          setStats(statsData);
          setProjects(projectsData.data ?? []);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const statsCards = [
    {
      label: "Total Project",
      value: stats?.total_project ?? projects.length,
      icon: <FiFolder className="w-5 h-5" />,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      label: "Aktif",
      value: stats?.project_aktif ?? projects.filter((p) => p.status === "active").length,
      icon: <FiActivity className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Task Selesai",
      value: stats?.task_done ?? 0,
      icon: <FiCheckCircle className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Overdue",
      value: stats?.task_overdue ?? 0,
      icon: <FiAlertTriangle className="w-5 h-5" />,
      color:
        (stats?.task_overdue ?? 0) > 0
          ? "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
          : "text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-500",
    },
  ];

  const filteredProjects = projects.filter((p) => {
    const nama = (p.nama ?? "").toLowerCase();
    const kode = (p.kode ?? "").toLowerCase();
    const q = search.toLowerCase();
    return !q || nama.includes(q) || kode.includes(q);
  });

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola dan pantau progress development.
          </p>
        </div>
        <Btn
          size="md"
          startContent={<FiPlus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Buat Project
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <TwInput
            value={search}
            onValueChange={setSearch}
            placeholder="Cari project..."
            startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
            inputSize="sm"
          />
        </div>
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FiFolder className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {search ? "Tidak ada project yang cocok" : "Belum ada project"}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {search
                ? "Coba kata kunci lain"
                : "Mulai dengan membuat project pertama Anda!"}
            </p>
            {!search && (
              <Btn
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
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id ?? project.id_project}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProjectCard project={project} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}
